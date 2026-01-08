import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-200 py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-white mb-4">Au Marais</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Appartement de charme au coeur du Marais, dans un immeuble du
              17ème siècle. Poutres apparentes, murs en pierres, et tout le
              charme parisien.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-medium mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-stone-400 hover:text-gold transition-colors duration-300 text-sm inline-block"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/appartement"
                  className="text-stone-400 hover:text-gold transition-colors duration-300 text-sm inline-block"
                >
                  Appartement
                </Link>
              </li>
              <li>
                <Link
                  href="/quartier"
                  className="text-stone-400 hover:text-gold transition-colors duration-300 text-sm inline-block"
                >
                  Le Quartier
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-stone-400 hover:text-gold transition-colors duration-300 text-sm inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm group">
                <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-gold/20 transition-colors">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                <span className="text-stone-400">
                  Rue François Miron, 75004 Paris
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-gold/20 transition-colors">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <a
                  href="tel:+33631598400"
                  className="text-stone-400 hover:text-gold transition-colors duration-300"
                >
                  +33 6 31 59 84 00
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-gold/20 transition-colors">
                  <Mail className="h-4 w-4 text-gold" />
                </div>
                <a
                  href="mailto:contact@au-marais.fr"
                  className="text-stone-400 hover:text-gold transition-colors duration-300"
                >
                  contact@au-marais.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <p className="text-stone-500 text-sm text-center">
            © {new Date().getFullYear()} Au Marais. Tous droits réservés.
          </p>
        </div>
      </Container>
    </footer>
  );
};
