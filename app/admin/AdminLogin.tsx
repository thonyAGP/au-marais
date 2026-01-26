'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { DevModeBanner } from '@/components/ui';
import { useAdminAuth } from './AdminAuthContext';

interface AdminLoginProps {
  title: string;
  subtitle: string;
}

export const AdminLogin = ({ title, subtitle }: AdminLoginProps) => {
  const { login, isLoading: authLoading } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    const result = await login(password);

    if (!result.success) {
      setLoginError(result.error || 'Mot de passe incorrect');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-stone-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h1 className="font-serif text-2xl text-text">{title}</h1>
            <p className="text-text-muted text-sm mt-2">{subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="Entrez le mot de passe"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs mt-6">
            Accès réservé à l&apos;administrateur
          </p>
        </div>
      </div>
    </div>
  );
};
