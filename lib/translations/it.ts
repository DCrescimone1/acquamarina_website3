import type { TranslationData } from './types'

/**
 * Italian translations for Acquamarina Casa Vacanze
 * Complete translation set with Italian as the default language
 */
export const itTranslations: TranslationData = {
  metadata: {
    title: "Rifugio di Lusso per Vacanze | Prenota la Tua Fuga Perfetta",
    description: "Vivi l'epitome del lusso costiero. Scopri la nostra squisita proprietà per vacanze con servizi premium, viste mozzafiato e servizio di classe mondiale. Prenota oggi la tua fuga da sogno.",
    keywords: "vacanze di lusso, casa al mare, affitto vacanze, rifugio costiero, Marzamemi, Sicilia",
    openGraph: {
      title: "Acquamarina Casa Vacanze - Rifugio di Lusso",
      description: "La tua perfetta fuga costiera a Marzamemi",
      siteName: "Acquamarina Casa Vacanze"
    },
    twitter: {
      title: "Acquamarina Casa Vacanze - Rifugio di Lusso",
      description: "La tua perfetta fuga costiera a Marzamemi"
    }
  },
  navigation: {
    home: "Home",
    property: "Proprietà",
    gallery: "Galleria",
    booking: "Prenotazioni",
    location: "Posizione",
    contact: "Contatti",
    bookNow: "PRENOTA ORA"
  },
  footer: {
    brand: {
      title: "Lusso",
      description: "Vivi l'epitome del lusso costiero con il nostro squisito rifugio per le vacanze."
    },
    navigation: {
      title: "Navigazione",
      home: "Home",
      property: "Proprietà",
      gallery: "Galleria",
      booking: "Prenotazioni",
      contact: "Contatti"
    },
    information: {
      title: "Informazioni",
      terms: "Termini",
      privacy: "Privacy",
      cancellation: "Cancellazione",
      faqs: "FAQ",
      support: "Supporto"
    },
    contact: {
      title: "Contatti",
      email: "acquamarina.marzamemi@gmail.com",
      phone: "+39 3501159152",
      social: {
        instagram: "Instagram",
        facebook: "Facebook",
        whatsapp: "WhatsApp"
      }
    },
    copyright: "Acquamarina Marzamemi. Tutti i diritti riservati.",
    tagline: "Progettato con eleganza per la tua fuga perfetta"
  },
  hero: {
    title: "LA TUA FUGA PERFETTA",
    subtitle: "",
    description: "A pochi passi dalla spiaggia in una residenza privata, a 400m dal porto di Marzamemi. Comfort moderni con fascino siciliano, cucina completamente attrezzata, due piscine e parcheggio privato per un soggiorno tranquillo",
    scrollText: "Scorri"
  },
  property: {
    sectionTitle: "Una Posizione Unica",
    locationTitle: "Acquamarina",
    description: "A pochi passi dalla spiaggia in una residenza privata, a 400m dal porto di Marzamemi. Confort moderni con fascino siciliano, cucina completamente attrezzata, giardino privato e parcheggio privato per un soggiorno tranquillo.",
    detailedDescription: "Appartamento esclusivo con 2 piscine a Marzamemi. Casa vacanze con 1 camera da letto, aria condizionata, WiFi gratuito, parcheggio privato, cucina completamente attrezzata e terrazza con vista mare. Piscina con giardino recintato. Nelle vicinanze: Spiaggia Cavettone (800m), Riserva di Vendicari (17km), Cattedrale di Noto (25km).",
    amenitiesTitle: "Servizi Premium",
    amenities: {
      bedrooms: {
        title: "Casa in Stile Siciliano",
        description: "Nuova costruzione elegante con giardinetto privato e architettura tradizionale"
      },
      kitchen: {
        title: "Luxury Resort",
        description: "Situata in un esclusivo luxury resort con posti auto privati riservati"
      },
      pool: {
        title: "Due Piscine",
        description: "Piscine con idromassaggio e piscina a sfioro panoramica"
      },
      terrace: {
        title: "Mare a Due Passi",
        description: "Alla spiaggia e al mare cristallino"
      },
      entertainment: {
        title: "Sport e Divertimento",
        description: "Campi da padel e beach volley per momenti di svago e competizione"
      },
      wellness: {
        title: "Fitness all'Aperto",
        description: "Palestra all'aperto attrezzata con pista ciclabile panoramica"
      }
    },
    stats: {
      bedrooms: "Posti Letto",
      bathrooms: "Bagno",
      area: "Mq"
    }
  },
  gallery: {
    title: "Tour Virtuale",
    subtitle: "Esplora la bellezza della nostra proprietà con la nostra collezione fotografica curata"
  },
  booking: {
    title: "Assicura il Tuo Soggiorno",
    subtitle: "Trova date disponibili e confronta tariffe su diverse piattaforme",
    findDatesTitle: "Trova le Tue Date",
    checkIn: "Check In",
    checkOut: "Check Out",
    adults: "Adulti",
    children: "Bambini",
    pets: "Animali",
    checkAvailability: "VERIFICA DISPONIBILITÀ",
    proceedBooking: "PROCEDI ALLA PRENOTAZIONE",
    checking: "Verificando...",
    selectDatesError: "Seleziona le date di check-in e check-out",
    availabilityError: "Impossibile verificare la disponibilità",
    priceComparison: "Confronto Prezzi",
    bestPrice: "Miglior Prezzo",
    view: "Visualizza",
    platforms: {
      direct: "Prenotazione Diretta"
    },
    calendar: {
      weekdays: {
        sun: "Dom",
        mon: "Lun",
        tue: "Mar",
        wed: "Mer",
        thu: "Gio",
        fri: "Ven",
        sat: "Sab"
      },
      legend: {
        selected: "Selezionato",
        booked: "Prenotato"
      },
      loadingError: "Errore nel caricamento del calendario"
    }
  },
  contact: {
    title: "Mettiti in Contatto",
    subtitle: "Hai domande? Siamo qui per aiutarti e pronti ad assistere con qualsiasi richiesta riguardo al tuo soggiorno",
    connectTitle: "Connettiamoci",
    email: "Email",
    phone: "Telefono",
    whatsapp: "WhatsApp",
    whatsappText: "Scrivici su WhatsApp",
    followUs: "Seguici",
    form: {
      name: "Il Tuo Nome",
      email: "La Tua Email",
      phone: "Numero di Telefono",
      message: "Il Tuo Messaggio",
      send: "INVIA MESSAGGIO",
      sending: "Invio in corso...",
      sent: "Messaggio Inviato!",
      error: "C'è stato un problema nell'invio del messaggio. Riprova."
    }
  },
  location: {
    title: "Dove Siamo",
    subtitle: "Situata in un incantevole ambiente costiero con facile accesso alle attrazioni locali e ai servizi",
    address: {
      label: "Indirizzo",
      value: "Contrada Calafarina SNC, Marzamemi (SR) 96018, Italia, Borgo84"
    },
    coordinates: {
      label: "Coordinate",
      value: "36.723632, 15.117694"
    },
    nearby: {
      label: "Nelle Vicinanze",
      value: "Porto di Marzamemi (400m), Spiaggia (1 min)"
    },
    gettingHere: {
      title: "Come Arrivare",
      items: [
        "Aeroporto di Comiso: 82 km, Aeroporto di Catania: 100 km",
        "Parcheggio privato gratuito in loco, nessuna prenotazione necessaria",
        "Ristoranti e negozi locali nel centro di Marzamemi (2 min)",
        "Accesso diretto alla spiaggia (5 min a piedi)"
      ]
    },
    whatsNearby: {
      title: "Cosa C'è Nelle Vicinanze",
      items: [
        "Spiaggia Cavettone (800m) - Bellissima spiaggia sabbiosa",
        "Riserva di Vendicari (17km) - Riserva naturale e area protetta",
        "Cattedrale di Noto (25km) - Architettura barocca storica",
        "Ristorante La Cialoma - Autentica cucina siciliana nel centro di Marzamemi"
      ]
    }
  },
  whatsapp: {
    defaultMessage: "Ciao! Sono interessato/a a prenotare Acquamarina Casa Vacanze a Marzamemi. Potreste fornirmi maggiori informazioni sulla disponibilità e i prezzi?"
  },
  chat: {
    tooltip: "Chatta con noi",
    header: {
      title: "Acquamarina",
      subtitle: "Casa Vacanze"
    },
    welcome: {
      greeting: "Benvenuto ad Acquamarina Casa Vacanze! 🌊",
      question: "Come possiamo aiutarti a pianificare la tua perfetta fuga costiera?"
    },
    input: {
      placeholder: "Scrivi il tuo messaggio...",
      send: "Invia messaggio"
    },
    aria: {
      openChat: "Acquamarina Casa Vacanze - Apri Chat",
      closeChat: "Chiudi chat",
      sendMessage: "Invia messaggio"
    }
  },
  common: {
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    close: "Chiudi",
    open: "Apri"
  },
  validation: {
    required: "Questo campo è obbligatorio",
    invalidDate: "Data non valida",
    pastDate: "La data non può essere nel passato",
    invalidDateRange: "La data di check-out deve essere successiva al check-in",
    minGuests: "Almeno 1 adulto è richiesto",
    maxGuests: "Massimo 6 ospiti consentiti",
    invalidEmail: "Indirizzo email non valido",
    invalidPhone: "Numero di telefono non valido"
  }
}

export default itTranslations