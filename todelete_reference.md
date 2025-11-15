Booking:

import { Language } from '@/lib/languageUtils';
import { SearchResult } from '@/components/price-comparison/types';
import { Browser } from 'playwright';
import { SCRAPING_CONFIG, BOOKING_CONFIG } from './config';

interface BookingSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  language: Language;
  browser: Browser;
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
  const languageSuffix = getLanguageSuffix(language as unknown as string);

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
  const { browser, dates } = params;
  let context;

  try {
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

    const page = await context.newPage();
    const url = buildBookingUrl(params);

    console.log('[prices] Booking.com search started');
    const startTime = Date.now();

    // Navigate to Booking.com URL with domcontentloaded strategy
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    let priceText: string | null = null;

    // Wait for price element with primary selector
    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });
      priceText = await page.textContent('.prco-valign-middle-helper');
    } catch (error) {
      // Implement fallback direct query if selector times out
      console.log('[prices] Primary selector timed out, trying fallback');
      priceText = await page.textContent('.prco-valign-middle-helper');
    }

    if (!priceText) {
      console.log('[prices] Booking.com: No price found');
      return null;
    }

    // Extract and parse price text, removing thousand separators
    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Booking.com: Could not parse price from text:', priceText);
      return null;
    }

    // Remove thousand separators (dots or commas) and parse
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);

    if (isNaN(price)) {
      console.log('[prices] Booking.com: Invalid price value:', cleanPrice);
      return null;
    }

    // Safety check: price should never be lower than (nights × €40)
    if (price < minimumPrice) {
      console.log(`[prices] Booking.com: Price ${price} is below minimum threshold ${minimumPrice} (${nights} nights × €40)`);
      return null;
    }

    const duration = Date.now() - startTime;
    console.log(`[prices] Booking.com search completed in ${duration}ms`);

    return {
      platform: 'Booking.com',
      price: price.toString(),
      currency: '€',
      url,
      logoSrc: '/logo/logo_booking.png',
    };
  } catch (error) {
    // Log errors with [prices] prefix
    console.error('[prices] Booking.com search error:', error);
    // Return null on extraction failure without throwing
    return null;
  } finally {
    // Close browser context in finally block
    if (context) {
      await context.close().catch((err) => {
        console.error('[prices] Error closing Booking.com context:', err);
      });
    }
  }
}
----
AirBnB:
import type { SearchResult } from '@/components/price-comparison/types';
import { Browser } from 'playwright';
import { SCRAPING_CONFIG, AIRBNB_CONFIG } from './config';

interface AirbnbSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  browser: Browser;
}

// Construct Airbnb URL with search parameters
function buildAirbnbUrl(params: AirbnbSearchParams): string {
  const { dates, guests } = params;
  const url = new URL(AIRBNB_CONFIG.baseUrl);
  url.searchParams.set('check_in', dates.from);
  url.searchParams.set('check_out', dates.to);
  url.searchParams.set('guests', (guests.adults + guests.children).toString());
  url.searchParams.set('currency', 'EUR');
  return url.toString();
}

// Search for price on Airbnb
export async function searchAirbnbPrice(
  params: AirbnbSearchParams
): Promise<SearchResult | null> {
  const { browser, dates } = params;
  let context;
  try {
    // Nights and minimum price safety
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;

    // Browser context
    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
    });
    const page = await context.newPage();
    const url = buildAirbnbUrl(params);

    console.log('[prices] Airbnb search started');
    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    // Trigger lazy loads
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Try to locate sidebar
    const sidebarSelectors = [
      '[data-section-id="BOOK_IT_SIDEBAR"]',
      '[data-testid="book-it-default"]',
      '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"]',
      '.c1yo0219',
    ];
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        sidebarFound = true;
        break;
      } catch {}
    }
    if (!sidebarFound) {
      console.log('[prices] Airbnb: Booking sidebar not found');
    }

    // Collect candidates
    const priceSelectors = [
      '[data-testid="book-it-default"] span',
      '._1y74zjx',
      '._tyxjp1',
      '._1k4xcdh',
      'span[aria-hidden="true"]',
    ];

    const priceCandidates: string[] = [];
    for (const selector of priceSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const el of elements) {
          const text = await el.textContent();
          if (text && text.trim()) {
            priceCandidates.push(text.trim());
          }
        }
      } catch {}
    }

    // Filter candidates
    const validCandidates = priceCandidates.filter((t) =>
      ((t.includes('€') || t.includes('EUR')) && /\d{2,}/.test(t))
    );

    const excludePatterns = ['originally', 'was', 'per night', '/night', 'for', 'nights'];
    const filteredCandidates = validCandidates.filter((text) => {
      const lower = text.toLowerCase();
      if (excludePatterns.some((p) => lower.includes(p))) return false;
      if (!text.includes('€') && !text.includes('EUR')) return false;
      if (!/\d/.test(text)) return false;
      return true;
    });

    // Choose best candidate
    let priceText: string | null = null;
    if (filteredCandidates.length > 0) {
      const simple = filteredCandidates.filter((t) => /^\d+$/.test(t.replace(/[€\s,\.]/g, '')));
      const list = simple.length > 0 ? simple : filteredCandidates;
      const withVals = list
        .map((t) => {
          const m = t.match(/[\d.,]+/);
          const v = m ? parseInt(m[0].replace(/\./g, '').replace(/,/g, ''), 10) : 0;
          return { t, v };
        })
        .filter((x) => !isNaN(x.v) && x.v > 0)
        .sort((a, b) => a.v - b.v);
      if (withVals.length > 0) priceText = withVals[0].t;
    }

    // Fallback full page scan
    if (!priceText) {
      console.log('[prices] Airbnb: Using full page scan fallback');
      priceText = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        const pricePattern = /€\s*[\d,\.]+/g;
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = (node.textContent || '');
          const matches = text.match(pricePattern);
          if (matches && matches.length > 0) {
            const parent = (node as any).parentElement as HTMLElement | null;
            if (parent) {
              const style = window.getComputedStyle(parent);
              const isStrike = style.textDecorationLine === 'line-through' || style.textDecoration.includes('line-through');
              if (!isStrike) {
                const lowerText = text.toLowerCase();
                if (!lowerText.includes('originally') && !lowerText.includes('was') && !lowerText.includes('per night') && !lowerText.includes('/night')) {
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

    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Airbnb: Could not parse price from text:', priceText);
      return null;
    }
    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);
    if (isNaN(price)) {
      console.log('[prices] Airbnb: Invalid price value:', cleanPrice);
      return null;
    }

    // Safety minimum
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
      logoSrc: '/logo/logo_airbnb.png',
    };
  } catch (error) {
    console.error('[prices] Airbnb search error:', error);
    return null;
  } finally {
    if (context) {
      await context.close().catch((err) => {
        console.error('[prices] Error closing Airbnb context:', err);
      });
    }
  }
}
---
config.ts:
import { ScrapingConfig } from './types';

/**
 * Browser configuration for scraping operations
 */
export const SCRAPING_CONFIG: ScrapingConfig = {
  viewport: {
    width: 1920,
    height: 1080,
  },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  navigationTimeout: 15000,
  selectorTimeout: 8000,
};

/**
 * Booking.com base URL and static parameters
 */
export const BOOKING_CONFIG = {
  baseUrl: 'https://www.booking.com/hotel/it/marzagem.html',
  staticParams: {
    aid: '397594',
    dest_id: '12041954',
    dest_type: 'hotel',
    no_rooms: '1',
    selected_currency: 'EUR',
    sb_price_type: 'total',
  },
};

/**
 * Airbnb base URL
 */
export const AIRBNB_CONFIG = {
  baseUrl: 'https://www.airbnb.com/rooms/1151412127742161355',
};

/**
 * Direct price calculation defaults
 */
export const DIRECT_PRICE_CONFIG = {
  discountPercentage: 5,
  minimumPerNight: 50,
};

----
Calculatedirectprice:
interface DirectPriceParams {
  otaPrices: Array<{ price: string }>;
  nights: number;
  discountPercentage?: number;
  minimumPerNight?: number;
}

/**
 * Calculate direct booking price based on OTA prices
 * 
 * @param otaPrices - Array of OTA price results (Booking.com, Airbnb)
 * @param nights - Number of nights for the stay
 * @param discountPercentage - Discount to apply (default: 5%)
 * @param minimumPerNight - Minimum price per night floor (default: €50)
 * @returns Calculated direct booking price as integer
 */
export function calculateDirectPrice({
  otaPrices,
  nights,
  discountPercentage = 5,
  minimumPerNight = 50,
}: DirectPriceParams): number {
  // Filter out null/invalid prices and parse to numbers
  const validPrices = otaPrices
    .filter(result => result && result.price)
    .map(result => parseFloat(result.price))
    .filter(price => !isNaN(price) && price > 0);

  // If no valid prices, return minimum
  if (validPrices.length === 0) {
    return minimumPerNight * nights;
  }

  // Calculate average of OTA prices
  const average = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;

  // Apply discount percentage
  const discounted = average * (1 - discountPercentage / 100);

  // Calculate per-night rate
  const perNight = discounted / nights;

  // Enforce minimum floor of €50 per night
  const minimumTotal = minimumPerNight * nights;
  const calculatedPrice = perNight < minimumPerNight ? minimumTotal : Math.round(discounted);

  // Ensure direct price is always lower than the minimum OTA price
  const minOtaPrice = Math.min(...validPrices);
  
  // If calculated price is higher than or equal to the lowest OTA price, 
  // apply discount to the lowest OTA price instead
  if (calculatedPrice >= minOtaPrice) {
    const adjustedPrice = Math.round(minOtaPrice * (1 - discountPercentage / 100));
    // Still respect the minimum floor
    return Math.max(adjustedPrice, minimumTotal);
  }

  return calculatedPrice;
}

