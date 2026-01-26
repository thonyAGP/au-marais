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
  emails: {
    fromEmail: string; // Email expéditeur (doit être vérifié dans Resend)
    fromName: string; // Nom affiché (ex: "Au Marais")
    adminEmails: string[]; // Liste des emails admin pour notifications
  };
}
