import type { TranslationData } from './types'

/**
 * English translations for Acquamarina Casa Vacanze
 * Organized existing English content into structured translation format
 */
export const enTranslations: TranslationData = {
  metadata: {
    title: "Luxury Holiday Retreat | Book Your Perfect Getaway",
    description: "Experience ultimate coastal luxury. Discover our exquisite holiday property with premium amenities, stunning views, and world-class service. Book your dream getaway today.",
    keywords: "luxury holiday, beach house, vacation rental, coastal retreat, Marzamemi, Sicily",
    openGraph: {
      title: "Acquamarina Casa Vacanze - Luxury Retreat",
      description: "Your perfect coastal escape in Marzamemi",
      siteName: "Acquamarina Casa Vacanze"
    },
    twitter: {
      title: "Acquamarina Casa Vacanze - Luxury Retreat",
      description: "Your perfect coastal escape in Marzamemi"
    }
  },
  navigation: {
    home: "Home",
    property: "Property",
    gallery: "Gallery",
    booking: "Booking",
    location: "Location",
    contact: "Contact",
    bookNow: "BOOK NOW"
  },
  footer: {
    brand: {
      title: "Luxury",
      description: "Experience the epitome of coastal luxury with our exquisite holiday retreat."
    },
    navigation: {
      title: "Navigation",
      home: "Home",
      property: "Property",
      gallery: "Gallery",
      booking: "Booking",
      contact: "Contact"
    },
    information: {
      title: "Information",
      terms: "Terms",
      privacy: "Privacy",
      cancellation: "Cancellation",
      faqs: "FAQs",
      support: "Support"
    },
    contact: {
      title: "Contact",
      email: "acquamarina.marzamemi@gmail.com",
      phone: "+39 3501159152",
      social: {
        instagram: "Instagram",
        facebook: "Facebook",
        whatsapp: "WhatsApp"
      }
    },
    copyright: "Acquamarina Marzamemi. All rights reserved.",
    tagline: "Designed with elegance for your perfect escape"
  },
  hero: {
    title: "YOUR PERFECT GETAWAY",
    subtitle: "Luxury Retreat by the Sea",
    description: "Experience the epitome of coastal luxury. A meticulously designed sanctuary combining contemporary comfort with timeless elegance",
    scrollText: "Scroll"
  },
  property: {
    sectionTitle: "A Unique Location",
    locationTitle: "Hope Cove",
    description: "Nestled on the edge of the sandy beach, this exquisite property offers breathtaking panoramic views of pristine coastlines. Every detail has been thoughtfully curated to provide the ultimate luxury experience.",
    detailedDescription: "The residence seamlessly blends contemporary design with timeless elegance, featuring premium materials, bespoke furnishings, and cutting-edge amenities throughout. Perfect for discerning travelers seeking an unforgettable coastal escape.",
    amenitiesTitle: "Premium Amenities",
    amenities: {
      bedrooms: {
        title: "Luxury Bedrooms",
        description: "Premium linens and bespoke furnishings"
      },
      kitchen: {
        title: "Gourmet Kitchen",
        description: "State-of-the-art appliances"
      },
      pool: {
        title: "Private Pool",
        description: "Heated infinity pool with sea views"
      },
      terrace: {
        title: "Terrace",
        description: "Panoramic ocean vistas"
      },
      entertainment: {
        title: "Entertainment",
        description: "Premium smart home systems"
      },
      wellness: {
        title: "Wellness",
        description: "Spa and meditation spaces"
      }
    },
    stats: {
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Sq M"
    }
  },
  booking: {
    title: "Secure Your Stay",
    subtitle: "Find available dates and check rates across platforms",
    findDatesTitle: "Find Your Dates",
    checkIn: "Check In",
    checkOut: "Check Out",
    adults: "Adults",
    children: "Children",
    pets: "Pets",
    checkAvailability: "CHECK AVAILABILITY",
    proceedBooking: "PROCEED TO BOOKING",
    checking: "Checking...",
    selectDatesError: "Please select check-in and check-out dates",
    availabilityError: "Failed to check availability",
    priceComparison: "Price Comparison",
    bestPrice: "Best Price",
    view: "View",
    calendar: {
      weekdays: {
        sun: "Sun",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat"
      },
      legend: {
        selected: "Selected",
        booked: "Booked"
      },
      loadingError: "Error loading calendar"
    }
  },
  contact: {
    title: "Get In Touch",
    subtitle: "Have questions? We're here to help and ready to assist with any inquiries about your stay",
    connectTitle: "Let's Connect",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    whatsappText: "WhatsApp us",
    followUs: "Follow Us",
    form: {
      name: "Your Name",
      email: "Your Email",
      phone: "Phone Number",
      message: "Your Message",
      send: "SEND MESSAGE",
      sending: "Sending...",
      sent: "Message Sent!",
      error: "There was a problem sending your message. Please try again."
    }
  },
  whatsapp: {
    defaultMessage: "Hello! I'm interested in booking Acquamarina Casa Vacanze in Marzamemi. Could you provide more information about availability and pricing?"
  },
  chat: {
    tooltip: "Chat with us",
    header: {
      title: "Acquamarina",
      subtitle: "Casa Vacanze"
    },
    welcome: {
      greeting: "Welcome to Acquamarina Casa Vacanze! 🌊",
      question: "How can we help you plan your perfect coastal getaway?"
    },
    input: {
      placeholder: "Type your message...",
      send: "Send message"
    },
    aria: {
      openChat: "Acquamarina Casa Vacanze - Open Chat",
      closeChat: "Close chat",
      sendMessage: "Send message"
    }
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    open: "Open"
  },
  validation: {
    required: "This field is required",
    invalidDate: "Invalid date",
    pastDate: "Date cannot be in the past",
    invalidDateRange: "Check-out date must be after check-in date",
    minGuests: "At least 1 adult is required",
    maxGuests: "Maximum 6 guests allowed",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number"
  }
}

export default enTranslations