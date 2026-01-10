import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui';

interface FooterDict {
  description: string;
  navigation: string;
  contact: string;
  legal: string;
  privacy: string;
  copyright: string;
}

interface NavDict {
  home: string;
  apartment: string;
  neighborhood: string;
  contact: string;
}

interface FooterProps {
  dict: FooterDict;
  nav: NavDict;
  locale: string;
}

// Helper to get locale-aware href
const getLocalizedHref = (href: string, locale: string) => {
  return `/${locale}${href}`;
};

export const Footer = ({ dict, nav, locale }: FooterProps) => {
  const navigation = [
    { name: nav.home, href: '' },
    { name: nav.apartment, href: '/appartement' },
    { name: nav.neighborhood, href: '/quartier' },
    { name: nav.contact, href: '/contact' },
  ];

  return (
    <footer className="bg-[#3D2C2C] border-t border-gold/20">
      {/* Main Footer */}
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 border border-gold flex items-center justify-center">
                <span className="font-serif text-gold">AM</span>
              </div>
              <span className="font-serif text-2xl text-cream">
                Au <span className="text-gold">Marais</span>
              </span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              {dict.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-6">
              {dict.navigation}
            </h4>
            <ul className="space-y-4">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={getLocalizedHref(item.href, locale)}
                    className="text-cream/60 hover:text-gold transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-6">
              {dict.contact}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-sm group">
                <div className="p-2 border border-gold/30 group-hover:border-gold/60 transition-colors">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                <span className="text-cream/60 pt-1">
                  Rue François Miron<br />75004 Paris
                </span>
              </li>
              <li className="flex items-center gap-4 text-sm group">
                <div className="p-2 border border-gold/30 group-hover:border-gold/60 transition-colors">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <a
                  href="tel:+33631598400"
                  className="text-cream/60 hover:text-gold transition-colors duration-300"
                >
                  +33 6 31 59 84 00
                </a>
              </li>
              <li className="flex items-center gap-4 text-sm group">
                <div className="p-2 border border-gold/30 group-hover:border-gold/60 transition-colors">
                  <Mail className="h-4 w-4 text-gold" />
                </div>
                <a
                  href="mailto:contact@au-marais.fr"
                  className="text-cream/60 hover:text-gold transition-colors duration-300"
                >
                  contact@au-marais.fr
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/40 text-xs tracking-wider">
              {dict.copyright.replace('{year}', new Date().getFullYear().toString())}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href={getLocalizedHref('/mentions-legales', locale)}
                className="text-cream/40 hover:text-gold text-xs transition-colors"
              >
                {dict.legal}
              </Link>
              <span className="text-cream/20">|</span>
              <Link
                href={getLocalizedHref('/confidentialite', locale)}
                className="text-cream/40 hover:text-gold text-xs transition-colors"
              >
                {dict.privacy}
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
