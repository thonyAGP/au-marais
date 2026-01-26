'use client';

import { Clock } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

export const TimeoutWarning = () => {
  const { showTimeoutWarning, extendSession, logout } = useAdminAuth();

  if (!showTimeoutWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-text">Session bientôt expirée</h2>
            <p className="text-text-muted text-sm">Vous serez déconnecté dans 1 minute</p>
          </div>
        </div>

        <p className="text-text-muted mb-6">
          Votre session va expirer pour cause d'inactivité. Cliquez sur "Rester connecté" pour continuer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 px-4 py-2 border border-stone-300 text-text-muted rounded-lg hover:bg-cream transition-colors"
          >
            Se déconnecter
          </button>
          <button
            onClick={extendSession}
            className="flex-1 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors font-medium"
          >
            Rester connecté
          </button>
        </div>
      </div>
    </div>
  );
};
