import { Browser } from 'playwright';
import { SearchResult } from './types';
import { SCRAPING_CONFIG, BOOKING_CONFIG } from './config';

interface BookingSearchParams {
  dates: { from: string; to: string };
  guests: { adults: number; children: number };
  language: string;
  browser: Browser;
  signal?: AbortSignal;
}

function getLanguageSuffix(language: string): string {
  const languageMap: Record<string, string> = {
    it: 'it-it',
    en: 'en-gb',
  };
  return languageMap[language] || 'en-gb';
}

function buildBookingUrl(params: BookingSearchParams): string {
  const { dates, guests, language } = params;
  const languageSuffix = getLanguageSuffix(language);

  const url = new URL(BOOKING_CONFIG.baseUrl);

  Object.entries(BOOKING_CONFIG.staticParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  url.searchParams.set('checkin', dates.from);
  url.searchParams.set('checkout', dates.to);
  url.searchParams.set('group_adults', guests.adults.toString());
  url.searchParams.set('group_children', guests.children.toString());
  for (let i = 0; i < guests.children; i++) {
    url.searchParams.append('age', '10');
  }

  url.pathname = url.pathname.replace('.html', `.${languageSuffix}.html`);

  return url.toString();
}

export async function searchBookingPrice(
  params: BookingSearchParams
): Promise<SearchResult | null> {
  const { browser, dates } = params;
  let context;

  try {
    const from = new Date(dates.from);
    const to = new Date(dates.to);
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minimumPrice = nights * 40;

    context = await browser.newContext({
      viewport: SCRAPING_CONFIG.viewport,
      userAgent: SCRAPING_CONFIG.userAgent,
    });

    const page = await context.newPage();
    const url = buildBookingUrl(params);

    console.log('[prices] Booking.com search started');
    console.log('[prices] Booking.com URL:', url);
    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPING_CONFIG.navigationTimeout,
    });

    let priceText: string | null = null;

    try {
      await page.waitForSelector('.prco-valign-middle-helper', {
        timeout: SCRAPING_CONFIG.selectorTimeout,
      });
      priceText = await page.textContent('.prco-valign-middle-helper');
    } catch {
      console.log('[prices] Primary selector timed out, trying fallback');
      priceText = await page.textContent('.prco-valign-middle-helper').catch(() => null);
    }

    if (!priceText) {
      console.log('[prices] Booking.com: No price found');
      return null;
    }

    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) {
      console.log('[prices] Booking.com: Could not parse price from text:', priceText);
      return null;
    }

    const cleanPrice = priceMatch[0].replace(/\./g, '').replace(/,/g, '');
    const price = parseInt(cleanPrice, 10);

    if (isNaN(price)) {
      console.log('[prices] Booking.com: Invalid price value:', cleanPrice);
      return null;
    }

    if (price < minimumPrice) {
      console.log(`[prices] Booking.com: Price ${price} below minimum ${minimumPrice}`);
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
    console.error('[prices] Booking.com search error:', error);
    return null;
  } finally {
    if (context) {
      console.log('[prices] Booking.com: Closing context');
      await context.close().catch((err) => {
        console.error('[prices] Error closing Booking.com context:', err);
      });
      console.log('[prices] Booking.com: Context closed');
    }
  }
}
