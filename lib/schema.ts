// Schema.org structured data for SEO

export const lodgingBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': 'https://au-marais.fr',
  name: 'Au Marais - Appartement de charme Paris',
  alternateName: 'Au Marais Paris',
  description:
    'Appartement de charme au coeur du Marais, entièrement rénové dans un immeuble du 17ème siècle. Poutres apparentes, murs en pierres.',
  url: 'https://au-marais.fr',
  telephone: '+33631598400',
  email: 'contact@au-marais.fr',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rue François Miron',
    addressLocality: 'Paris',
    addressRegion: 'Île-de-France',
    postalCode: '75004',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 48.85551,
    longitude: 2.358149,
  },
  image: [
    'https://au-marais.fr/images/apartment/01-salon.jpg',
    'https://au-marais.fr/images/apartment/02-chambre.jpg',
    'https://au-marais.fr/images/apartment/03-cuisine.jpg',
  ],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  checkinTime: '15:00',
  checkoutTime: '11:00',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Kitchen', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Heating', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'TV', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Hair Dryer', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Iron', value: true },
  ],
  numberOfRooms: 2,
  petsAllowed: false,
  starRating: {
    '@type': 'Rating',
    ratingValue: '4.97',
    bestRating: '5',
    worstRating: '1',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.97',
    reviewCount: '89',
    bestRating: '5',
  },
  containsPlace: {
    '@type': 'Accommodation',
    name: 'Appartement Au Marais',
    description: 'Appartement 2 pièces avec poutres apparentes',
    occupancy: {
      '@type': 'QuantitativeValue',
      value: 4,
      unitText: 'guests',
    },
    numberOfBedrooms: 1,
    numberOfBathroomsTotal: 1,
    bed: [
      { '@type': 'BedDetails', typeOfBed: 'Double', numberOfBeds: 1 },
      { '@type': 'BedDetails', typeOfBed: 'Sofa bed', numberOfBeds: 1 },
    ],
    floorSize: {
      '@type': 'QuantitativeValue',
      value: 35,
      unitCode: 'MTK',
    },
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://au-marais.fr/contact',
      actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
    },
    result: {
      '@type': 'LodgingReservation',
      name: 'Réservation Au Marais',
    },
  },
  sameAs: ['https://www.airbnb.fr/rooms/618442543008929958'],
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const faqSchema = (
  faqs: { question: string; answer: string }[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});
