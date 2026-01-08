export interface SiteSettings {
  discounts: {
    weekly: number;
    biweekly: number;
    monthly: number;
  };
  airbnb: {
    nightlyMarkup: number; // % de majoration sur le prix par nuit
    cleaningFee: number; // Frais de ménage fixes
    touristTax: number; // Taxe de séjour par personne par nuit
    listingId: string;
  };
  contact: {
    whatsapp: string;
  };
}
