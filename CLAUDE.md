# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luxury holiday retreat website built with Next.js 16 App Router, TypeScript, and Tailwind CSS v4. Features multi-language support (Italian/English), booking system with Stripe payments, and calendar integration with Airbnb/Booking.com.

## Essential Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Architecture

### App Router Structure
- `app/page.tsx` - Landing page
- `app/api/calendar/route.ts` - Calendar availability from external sources
- `app/api/create-checkout-session/route.ts` - Stripe payment processing
- `app/api/search-prices/route.ts` - Price comparison functionality
- `app/booking-*/` - Booking flow pages

### Component Organization
- `components/sections/` - Page sections (hero, features, contact, etc.)
- `components/booking/` - Booking-specific components
- `components/ui/` - shadcn/ui components (do not modify directly)
- `components/navigation.tsx` - Main navigation
- `components/footer.tsx` - Site footer

### State Management
- React Context for language switching (`lib/contexts/language-context.tsx`)
- Local state for booking flow and form handling
- No global state management library

### Internationalization
Custom i18n system in `lib/translations/`:
- `useTranslation()` hook for component translations
- Language persistence in localStorage
- Fallback to Italian for missing translations

### External Integrations
- **Stripe**: Payment processing with embedded checkout
- **EmailJS**: Contact form emails (service ID: service_72zqz8f)
- **Calendar**: iCal parsing from Airbnb/Booking.com URLs
- **Analytics**: Vercel Analytics integrated

## Key Technical Decisions

1. **TypeScript Strict Mode**: Enabled but build errors ignored in production (`next.config.mjs`)
2. **Image Optimization**: Disabled (`unoptimized: true`) - likely for external image sources
3. **Calendar Caching**: 5-minute cache for availability data
4. **No Testing Framework**: Project lacks testing setup
5. **Tailwind CSS v4**: Using latest version with PostCSS

## Environment Variables

Required variables in `.env.local`:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

Missing (likely in production):
- Stripe keys for payment processing
- Calendar URLs for availability

## Common Development Tasks

### Adding New Sections
1. Create component in `components/sections/`
2. Import and add to main page (`app/page.tsx`)
3. Follow existing patterns for responsive design and translations

### Modifying Booking Flow
1. Booking components are in `components/booking/`
2. API endpoints in `app/api/`
3. Stripe integration in `app/api/create-checkout-session/route.ts`

### Adding Translations
1. Add keys to `lib/translations/it.ts` and `lib/translations/en.ts`
2. Use `useTranslation()` hook in components
3. Follow existing naming conventions

### Working with Calendar
1. Calendar logic in `app/api/calendar/route.ts`
2. Uses ical.js for parsing
3. 5-minute cache implemented for performance

## Important Notes

- **Contact Form**: Currently non-functional (only logs to console)
- **Email System**: EmailJS configured but contact form needs API endpoint
- **No Database**: Relies on external APIs and Stripe for data
- **Mobile-First**: All components should be responsive
- **Luxury Branding**: Maintain high-end aesthetic with coastal color palette