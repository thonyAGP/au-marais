export interface SiteSettings {
  discounts: {
    weekly: number;
    biweekly: number;
    monthly: number;
  };
  airbnb: {
    serviceFee: number;
    listingId: string;
  };
  contact: {
    whatsapp: string;
  };
}
