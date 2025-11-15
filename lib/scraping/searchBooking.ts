import { Browser, BrowserContext } from 'playwright';
import { SearchResult } from './types';
import { SCRAPING_CONFIG, BOOKING_CONFIG } from './config';

interface BookingSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  language: string;
  browser: Browser;
  signal?: AbortSignal;
}

/**
 * Map language codes to Booking.com language suffixes
 */
function getLanguageSuffix(language: string): string {
  const languageMap: Record<string, string> = {
    it: 'it-it',
    en: 'en-gb',
  };
  return languageMap[language] || 'en-gb';
}

/**
 * Construct Booking.com URL with search parameters
 */
function buildBookingUrl(params: BookingSearchParams): string {
  const { dates, guests, language } = params;
  const languageSuffix = getLanguageSuffix(language);
  
  // Build URL with static and dynamic parameters
  const url = new URL(BOOKING_CONFIG.baseUrl);
  
  // Add static parameters
  Object.entries(BOOKING_CONFIG.staticParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  // Add dynamic parameters
  url.searchParams.set('checkin', dates.from);
  url.searchParams.set('checkout', dates.to);
  url.searchParams.set('group_adults', guests.adults.toString());
  url.searchParams.set('group_children', guests.children.toString());
  
  // Add language suffix to pathname
  url.pathname = url.pathname.replace('.html', `.${languageSuffix}.html`);
  
  return url.toString();
}

/**
 * Search for price on Booking.com
 * Returns SearchResult or null if extraction fails
 */
export async function searchBookingPrice(
  params: BookingSearchParams
): Promise<SearchResult | null> {
  const { browser, dates, signal } = params;
  let context: BrowserContext | null = null;
  const reasons: string[] = [];
  
  try {
    if (signal?.aborted) {
      console.log('[prices] Booking.com: Aborted before start');
      return null;
    }
    // Calculate number of nights for safety check
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;
    
    // Create browser context with desktop viewport and user agent
    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
      extraHTTPHeaders: {
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
    });
    // Block heavy resources to speed up page load
    try {
      await context.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (type === 'image' || type === 'media' || type === 'font') {
          return route.abort();
        }
        return route.continue();
      });
    } catch {}
    // If aborted, close immediately
    if (signal?.aborted) {
      console.log('[prices] Booking.com: Aborted after context open');
      await context.close().catch(() => {});
      return null;
    }
    const abortHandler = async () => {
      try { await context?.close(); } catch {}
    };
    signal?.addEventListener('abort', abortHandler, { once: true });
    
    const page = await context.newPage();
    const url = buildBookingUrl(params);
    
    console.log('[prices] Booking.com search started');
    const startTime = Date.now();
    console.log('[prices] Booking.com URL:', url);
    
    // Navigate to Booking.com URL with domcontentloaded strategy
    if (signal?.aborted) return null;
    let gotoResponse = null as import('playwright').Response | null;
    try {
      gotoResponse = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: SCRAPING_CONFIG.navigationTimeout,
      });
    } catch (e: any) {
      reasons.push(`goto-error:${e?.name || 'Error'}`);
      console.error('[prices] Booking.com: Navigation error:', e);
      // continue, selectors may still be present if partial load
    }
    try {
      const status = gotoResponse?.status();
      const respUrl = gotoResponse?.url();
      console.log('[prices] Booking.com: Navigation response', { status, url: respUrl });
    } catch {}
    
    // Handle cookie consent if present (OneTrust or site-specific)
    try {
      if (signal?.aborted) return null;
      const cookieSelectors = [
        '#onetrust-accept-btn-handler',
        'button#onetrust-accept-btn-handler',
        'button[aria-label="Accept"]',
        'button[aria-label*="Accetta"]',
        'button[aria-label*="Accept all"]',
        'button[aria-label*="Accetta tutto"]',
        'button[aria-label*="Consenti"]',
        '[data-testid="accept-cookies-button"]',
      ];
      for (const cSel of cookieSelectors) {
        const cookieBtn = await page.$(cSel);
        if (cookieBtn) {
          console.log('[prices] Booking.com: Clicking cookie consent');
          await cookieBtn.click({ timeout: 500 }).catch(() => {});
          break;
        }
      }
    } catch {
      reasons.push('cookie-consent-skip');
    }
    
    // Some hotel pages require clicking the availability CTA to show room table
    try {
      if (signal?.aborted) return null;
      const ctaSelectors = [
        'a[data-testid="availability-cta"]',
        'button[data-testid="availability-cta"]',
        'a[href*="#availability"]',
        'a[href*="select_room"]',
        'button:has-text("Vedi disponibilità")',
        'button:has-text("See availability")',
      ];
      let clicked = false;
      for (const sel of ctaSelectors) {
        const el = await page.$(sel);
        if (el) {
          console.log('[prices] Booking.com: Clicking availability CTA');
          await el.click({ timeout: 800 }).catch(() => {});
          clicked = true;
          break;
        }
      }
      if (clicked) {
        if (signal?.aborted) return null;
        // Wait longer for slower hardware - wait for network to settle
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
          // Fallback to domcontentloaded if networkidle times out
          return page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
        });
        // Additional wait for dynamic content to render on slower hardware
        await page.waitForTimeout(1500).catch(() => {});
        console.log('[prices] Booking.com: Waited for page to settle after CTA click');
      }
    } catch {
      reasons.push('availability-cta-skip');
    }
    
    // Scroll a bit to trigger lazy room table rendering
    try {
      if (signal?.aborted) return null;
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);
      // Scroll more to ensure table is in viewport
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(500);
    } catch {}

    // Wait for availability/room table container to be present with longer timeout for slower hardware
    try {
      if (signal?.aborted) return null;
      const availabilitySelectors = [
        '#availability',
        '[data-component="roomlist"]',
        '.hprt-table',
        '.hprt-table-cell-price',
        '.hprt-price-block',
      ];
      let found = false;
      // Try waiting for any of these selectors with increased timeout for Raspberry Pi
      for (const sel of availabilitySelectors) {
        try {
          // Increased timeout from 1800ms to 4000ms for slower hardware
          await page.waitForSelector(sel, { timeout: 4000, state: 'attached' });
          console.log('[prices] Booking.com: Availability container found via', sel);
          found = true;
          // Wait a bit more for content to fully render
          await page.waitForTimeout(300).catch(() => {});
          break;
        } catch {
          reasons.push(`availability-container-timeout:${sel}`);
        }
      }
      if (!found) {
        console.log('[prices] Booking.com: Availability container not detected yet, continuing anyway');
        // Even if not found, wait a bit more - content might be loading
        await page.waitForTimeout(1000).catch(() => {});
      }
    } catch {
      reasons.push('availability-container-check-error');
    }
    
    let priceText: string | null = null;

    // Short settle then bulk scan early to avoid long per-selector waits
    try {
      if (signal?.aborted) return null;
      await page.waitForTimeout(500);
      const earlyText = await page.evaluate(() => (document.body.textContent || '').replace(/\u00A0/g, ' '));
      const earlyMatch = earlyText.match(/€\s*[\d.,]+/);
      if (earlyMatch) {
        priceText = earlyMatch[0];
        console.log('[prices] Booking.com: Early bulk scan found price:', priceText);
      }
    } catch {
      reasons.push('early-bulk-scan-error');
    }
    
    if (!priceText) {
      const selectors = [
        '[data-testid="price-and-discounted-price"]',
        'span[data-testid="price-and-discounted-price"]',
        '.prco-valign-middle-helper',
        'span.prco-valign-middle-helper',
        'div.f6431b446c span',
        // Fallback selectors from Booking.com HTML structure
        'span.bui-u-sr-only',
        '.bui-u-sr-only',
        '.hprt-price-block .bui-u-sr-only',
        '.hprt-table-cell-price .bui-u-sr-only',
        '.hprt-price-block .prco-valign-middle-helper',
        '.prco-wrapper .prco-valign-middle-helper',
        '.prco-wrapper .bui-u-sr-only',
        '.bui-price-display_value .bui-u-sr-only',
        '[data-hotel-rounded-price]',
      ];

      // Try selectors with increased timeout for slower hardware
      for (const selector of selectors) {
        try {
          if (signal?.aborted) return null;
          // Increased timeout from 800ms to 2000ms for slower hardware
          await page.waitForSelector(selector, { timeout: 2000, state: 'attached' });
          const txt = await page.textContent(selector);
          if (txt && /[€\d]/.test(txt)) {
            priceText = txt;
            console.log(`[prices] Booking.com: Found price using selector "${selector}": ${priceText}`);
            break;
          }
        } catch {
          reasons.push(`selector-timeout:${selector}`);
          // Don't log every timeout to reduce noise
          continue;
        }
      }
    }
    
    // Try data attribute(s) as fallback before DOM walker
    if (!priceText) {
      try {
        if (signal?.aborted) return null;
        // Wait longer for any rows with rounded price to appear on slower hardware
        await page.waitForSelector('[data-hotel-rounded-price]', { timeout: 3000, state: 'attached' }).catch(() => {});
        const roundedValues = await page.$$eval('[data-hotel-rounded-price]', (nodes) =>
          nodes
            .map((n) => (n as HTMLElement).getAttribute('data-hotel-rounded-price') || '')
            .filter(Boolean)
        );
        if (roundedValues && roundedValues.length > 0) {
          const nums = roundedValues
            .map((v) => parseInt(v.replace(/\D+/g, ''), 10))
            .filter((n) => Number.isFinite(n) && n > 0)
            .sort((a, b) => a - b);
          if (nums.length > 0) {
            priceText = `€ ${nums[0]}`;
            console.log('[prices] Booking.com: Found price from data-hotel-rounded-price list:', priceText, roundedValues);
          }
        }
      } catch {
        // Continue to fallback scan
        reasons.push('data-attr-fallback-error');
      }
    }
    
    // Direct extraction from room price block if present
    if (!priceText) {
      try {
        if (signal?.aborted) return null;
        const blockText = await page.$eval('.hprt-price-block', (el) => el.textContent || '');
        if (blockText && /[€\d]/.test(blockText)) {
          const normalized = blockText.replace(/\u00A0/g, ' ');
          const match = normalized.match(/€\s*[\d.,]+/);
          if (match) {
            priceText = match[0];
            console.log('[prices] Booking.com: Found price from .hprt-price-block:', priceText);
          }
        }
      } catch {
        reasons.push('price-block-eval-error');
      }
    }

    // Scan the availability area broadly for a price pattern
    if (!priceText) {
      try {
        if (signal?.aborted) return null;
        const areaText = await page.evaluate(() => {
          const container = document.querySelector('#availability') ||
            document.querySelector('[data-component="roomlist"]') ||
            document.querySelector('.hprt-table') || document.body;
          return (container?.textContent || '').replace(/\u00A0/g, ' ');
        });
        const match = areaText?.match(/€\s*[\d.,]+/);
        if (match) {
          priceText = match[0];
          console.log('[prices] Booking.com: Found price from availability container scan:', priceText);
        }
      } catch {
        reasons.push('availability-area-scan-error');
      }
    }
    
    if (!priceText) {
      console.log('[prices] Booking.com: No price from selectors, attempting fallback scan');
      try {
        if (signal?.aborted) return null;
        priceText = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const pricePattern = /€\s*[\d,.]+/g;
          let node: Node | null;
          while ((node = walker.nextNode())) {
            const text = (node.textContent || '').trim();
            if (!text) continue;
            const matches = text.match(pricePattern);
            if (matches && matches.length > 0) {
              const parent = (node as any).parentElement as HTMLElement | null;
              if (parent) {
                const style = window.getComputedStyle(parent);
                const isStrikethrough = style.textDecorationLine === 'line-through' || style.textDecoration.includes('line-through');
                if (!isStrikethrough) {
                  return matches[0];
                }
              }
              return matches[0];
            }
          }
          return null;
        });
        if (priceText) {
          console.log(`[prices] Booking.com: Found price from fallback scan: ${priceText}`);
        }
      } catch (error) {
        console.error('[prices] Booking.com: Fallback scan failed:', error);
        // Continue - priceText will remain null
        reasons.push('evaluate-fallback-error');
      }
    }
    
    if (!priceText) {
      console.log('[prices] Booking.com: No price found');
      if (reasons.length) console.log('[prices] Booking.com: Reasons:', reasons.join(','));
      return null;
    }
    
    // Extract and parse price text, removing thousand separators
    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Booking.com: Could not parse price from text:', priceText);
      if (reasons.length) console.log('[prices] Booking.com: Reasons:', reasons.join(','));
      return null;
    }
    
    // Remove thousand separators (dots or commas) and parse
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);
    
    if (isNaN(price)) {
      console.log('[prices] Booking.com: Invalid price value:', cleanPrice);
      if (reasons.length) console.log('[prices] Booking.com: Reasons:', reasons.join(','));
      return null;
    }
    
    // Safety check: price should never be lower than (nights × €40)
    if (price < minimumPrice) {
      console.log(`[prices] Booking.com: Price ${price} is below minimum threshold ${minimumPrice} (${nights} nights × €40)`);
      if (reasons.length) console.log('[prices] Booking.com: Reasons:', reasons.join(','));
      return null;
    }
    
    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);
    
    return {
      platform: 'Booking.com',
      price: price.toString(),
      currency: '€',
      url,
      logoSrc: '/booking-logo.svg',
    };
  } catch (error) {
    // Log errors with [prices] prefix
    console.error('[prices] Booking.com search error:', error);
    // Return null on extraction failure without throwing
    return null;
  } finally {
    // Close browser context in finally block
    if (reasons.length) {
      try {
        console.log('[prices] Booking.com: Reasons (final):', reasons.join(','));
      } catch {}
    }
    if (context) {
      await context.close().catch((err) => {
        console.error('[prices] Error closing Booking.com context:', err);
      });
    }
  }
}
