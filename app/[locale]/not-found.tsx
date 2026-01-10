import Link from 'next/link';
import { Container } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Container>
        <div className="text-center">
          <h1 className="font-serif text-6xl text-gold mb-4">404</h1>
          <h2 className="font-serif text-3xl text-text mb-6">Page non trouvée</h2>
          <p className="text-text-muted mb-8">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </Container>
    </div>
  );
}
