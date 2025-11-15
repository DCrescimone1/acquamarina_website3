import { Browser, BrowserContext } from 'playwright';
import { SearchResult } from './types';
import { SCRAPING_CONFIG, AIRBNB_CONFIG } from './config';

interface AirbnbSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  browser: Browser;
  signal?: AbortSignal;
}

/**
 * Construct Airbnb URL with search parameters
 */
function buildAirbnbUrl(params: AirbnbSearchParams): string {
  const { dates, guests } = params;
  
  const url = new URL(AIRBNB_CONFIG.baseUrl);
  
  // Add search parameters
  url.searchParams.set('check_in', dates.from);
  url.searchParams.set('check_out', dates.to);
  url.searchParams.set('guests', (guests.adults + guests.children).toString());
  url.searchParams.set('currency', 'EUR');
  
  return url.toString();
}

/**
 * Search for price on Airbnb
 * Returns SearchResult or null if extraction fails
 */
export async function searchAirbnbPrice(
  params: AirbnbSearchParams
): Promise<SearchResult | null> {
  const { browser, dates, signal } = params;
  let context: BrowserContext | null = null;
  
  try {
    if (signal?.aborted) return null;
    // Calculate number of nights for safety check
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;
    
    // Create browser context with desktop viewport and user agent
    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
    });
    if (signal?.aborted) {
      await context.close().catch(() => {});
      return null;
    }
    const abortHandler = async () => {
      try { await context?.close(); } catch {}
    };
    signal?.addEventListener('abort', abortHandler, { once: true });
    
    const page = await context.newPage();
    const url = buildAirbnbUrl(params);
    
    console.log('[prices] Airbnb search started');
    const startTime = Date.now();
    console.log('[prices] Airbnb URL:', url);
    
    // Navigate to Airbnb URL with domcontentloaded strategy
    if (signal?.aborted) return null;
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });
    
    // Scroll 300px down to trigger lazy-loaded content
    if (signal?.aborted) return null;
    await page.evaluate(() => window.scrollBy(0, 300));
    
    // Wait briefly for lazy-loaded content to appear
    if (signal?.aborted) return null;
    await page.waitForTimeout(500);

    // Wait for booking sidebar with multiple selector fallbacks
    const sidebarSelectors = [
      '[data-section-id="BOOK_IT_SIDEBAR"]',
      '[data-testid="book-it-default"]',
      '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"]',
      '.c1yo0219',
    ];
    
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      try {
        if (signal?.aborted) return null;
        await page.waitForSelector(selector, { timeout: 1200 });
        sidebarFound = true;
        break;
      } catch {
        // Try next selector
        continue;
      }
    }
    
    if (!sidebarFound) {
      console.log('[prices] Airbnb: Booking sidebar not found');
    }
    
    // Collect price candidates from various selectors
    const priceSelectors = [
      '[data-testid="book-it-default"] span',
      '._1y74zjx',
      '._tyxjp1',
      '._1k4xcdh',
      'span[aria-hidden="true"]',
    ];
    
    const priceCandidates: Array<{ text: string; element: any }> = [];
    
    for (const selector of priceSelectors) {
      try {
        if (signal?.aborted) return null;
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            priceCandidates.push({ text: text.trim(), element });
          }
        }
      } catch {
        // Continue with next selector
        continue;
      }
    }
    
    // Detect and filter strikethrough prices using computed styles
    const validCandidates: string[] = [];
    
    for (const candidate of priceCandidates) {
      try {
        const isStrikethrough = await candidate.element.evaluate((el: HTMLElement) => {
          const style = window.getComputedStyle(el);
          return style.textDecorationLine === 'line-through' || 
                 style.textDecoration.includes('line-through');
        });
        
        if (!isStrikethrough) {
          validCandidates.push(candidate.text);
        }
      } catch {
        // If we can't check styling, include it as a candidate
        validCandidates.push(candidate.text);
      }
    }
    
    // Filter candidates to prefer non-strikethrough prices with currency symbols
    // Exclude prices containing "originally", "was", "per night", "/night", "for X nights"
    const excludePatterns = ['originally', 'was', 'per night', '/night', 'for', 'nights'];
    
    const filteredCandidates = validCandidates.filter((text) => {
      const lowerText = text.toLowerCase();
      
      // Exclude if contains any exclude pattern
      if (excludePatterns.some((pattern) => lowerText.includes(pattern))) {
        return false;
      }
      
      // Must contain currency symbol (€ or EUR)
      if (!text.includes('€') && !text.includes('EUR')) {
        return false;
      }
      
      // Must contain digits
      if (!/\d/.test(text)) {
        return false;
      }
      
      return true;
    });
    
    // Select best candidate from filtered list
    let priceText: string | null = null;
    
    if (filteredCandidates.length > 0) {
      // Prefer candidates with just numbers and currency (simpler format like "€ 243")
      const simpleCandidates = filteredCandidates.filter((text) => {
        const cleaned = text.replace(/[€\s,\.]/g, '');
        return /^\d+$/.test(cleaned);
      });
      
      // Sort by price value (ascending) to get the lowest price first
      const sortedCandidates = simpleCandidates.length > 0 ? simpleCandidates : filteredCandidates;
      const pricesWithValues = sortedCandidates.map((text) => {
        const match = text.match(/[\d.,]+/);
        const value = match ? parseInt(match[0].replace(/\./g, '').replace(/,/g, ''), 10) : 0;
        return { text, value };
      }).filter((item) => !isNaN(item.value) && item.value > 0);
      
      // Select the lowest price
      if (pricesWithValues.length > 0) {
        pricesWithValues.sort((a, b) => a.value - b.value);
        priceText = pricesWithValues[0].text;
      }
    }

    // Implement full page scan fallback if no price found
    if (!priceText) {
      console.log('[prices] Airbnb: Using full page scan fallback');
      
      if (signal?.aborted) return null;
      priceText = await page.evaluate(() => {
        // Use tree walker to search all text nodes
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        // Find price patterns with regex
        const pricePattern = /€\s*[\d,\.]+/g;
        
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent || '';
          const matches = text.match(pricePattern);
          
          if (matches && matches.length > 0) {
            // Check parent element styling for strikethrough
            const parent = node.parentElement;
            if (parent) {
              const style = window.getComputedStyle(parent);
              const isStrikethrough = 
                style.textDecorationLine === 'line-through' || 
                style.textDecoration.includes('line-through');
              
              // Return first valid non-strikethrough price
              if (!isStrikethrough) {
                const lowerText = text.toLowerCase();
                if (
                  !lowerText.includes('originally') &&
                  !lowerText.includes('was') &&
                  !lowerText.includes('per night') &&
                  !lowerText.includes('/night')
                ) {
                  return matches[0];
                }
              }
            }
          }
        }
        
        return null;
      });
    }
    
    if (!priceText) {
      console.log('[prices] Airbnb: No price found');
      return null;
    }
    
    // Extract and parse price
    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Airbnb: Could not parse price from text:', priceText);
      return null;
    }
    
    // Remove thousand separators and parse
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);
    
    if (isNaN(price)) {
      console.log('[prices] Airbnb: Invalid price value:', cleanPrice);
      return null;
    }
    
    // Safety check: price should never be lower than (nights × €40)
    if (price < minimumPrice) {
      console.log(`[prices] Airbnb: Price ${price} is below minimum threshold ${minimumPrice} (${nights} nights × €40)`);
      return null;
    }
    
    const duration = Date.now() - startTime;
    console.log(`[prices] Airbnb search completed in ${duration}ms`);
    
    return {
      platform: 'Airbnb',
      price: price.toString(),
      currency: '€',
      url,
      logoSrc: '/airbnb-logo.svg',
    };
  } catch (error) {
    // Log errors with [prices] prefix
    console.error('[prices] Airbnb search error:', error);
    // Return null on extraction failure without throwing
    return null;
  } finally {
    // Close browser context in finally block
    if (context) {
      await context.close().catch((err) => {
        console.error('[prices] Error closing Airbnb context:', err);
      });
    }
  }
}
