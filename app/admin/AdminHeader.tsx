'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Settings, Calendar } from 'lucide-react';
import { Container } from '@/components/ui';
import { useAdminAuth } from './AdminAuthContext';

export const AdminHeader = () => {
  const { logout } = useAdminAuth();
  const pathname = usePathname();

  const isSettings = pathname === '/admin';
  const isReservations = pathname?.startsWith('/admin/reservations');

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <Container size="lg">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-text">Au <span className="text-gold">Marais</span></span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted text-sm">Administration</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/reservations"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isReservations
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-muted hover:text-text hover:bg-cream'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Réservations
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isSettings
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-muted hover:text-text hover:bg-cream'
              }`}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text hover:bg-cream rounded-lg transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};
