'use client';

import { useState, useEffect } from 'react';
import { Container, DevModeBanner } from '@/components/ui';
import { Lock, Save, LogOut, Settings, Percent, Phone, ExternalLink } from 'lucide-react';
import type { SiteSettings } from '@/types/settings';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Vérifier si déjà authentifié
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsAuthenticated(true);
        loadSettings(token);
      } else {
        sessionStorage.removeItem('adminToken');
      }
    } catch {
      sessionStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        loadSettings(data.token);
      } else {
        setLoginError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setLoginError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (token: string) => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch {
      console.error('Erreur lors du chargement des paramètres');
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    setSaveStatus('saving');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setSettings(null);
    setPassword('');
  };

  const updateSetting = <K extends keyof SiteSettings>(
    category: K,
    key: keyof SiteSettings[K],
    value: string | number
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-stone-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                <Lock className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-serif text-2xl text-text">Administration</h1>
              <p className="text-text-muted text-sm mt-2">Au Marais - Paramétrage</p>
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
  }

  // Écran de paramétrage
  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl text-text">Au <span className="text-gold">Marais</span></span>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted text-sm">Administration</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text hover:bg-cream rounded-lg transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </Container>
      </header>

      <div className="py-8">
      <Container size="md">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-gold" />
          <div>
            <h1 className="font-serif text-2xl text-text">Paramétrage</h1>
            <p className="text-text-muted text-sm">Configuration du site Au Marais</p>
          </div>
        </div>

        {settings && (
          <div className="space-y-6">
            {/* Réductions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <Percent className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl text-text">Réductions par durée</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">
                Ces réductions sont appliquées automatiquement selon la durée du séjour.
                Mettez 0 pour désactiver une réduction.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Semaine (7+ nuits)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.discounts.weekly}
                      onChange={(e) => updateSetting('discounts', 'weekly', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    2 semaines (14+ nuits)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.discounts.biweekly}
                      onChange={(e) => updateSetting('discounts', 'biweekly', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Mensuel (28+ nuits)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.discounts.monthly}
                      onChange={(e) => updateSetting('discounts', 'monthly', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Airbnb */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl text-text">Configuration Airbnb</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">
                Paramètres pour calculer le prix Airbnb équivalent (comparaison).
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Majoration nuitée Airbnb
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.airbnb.nightlyMarkup}
                      onChange={(e) => updateSetting('airbnb', 'nightlyMarkup', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">%</span>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">Différence de prix par nuit vs direct</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Frais de ménage Airbnb
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.airbnb.cleaningFee}
                      onChange={(e) => updateSetting('airbnb', 'cleaningFee', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">€</span>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">Frais fixes ajoutés sur Airbnb</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Taxe de séjour / pers / nuit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.airbnb.touristTax}
                      onChange={(e) => updateSetting('airbnb', 'touristTax', Number(e.target.value))}
                      className="w-full px-4 py-2 pr-8 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">€</span>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">Appliquée pour 2 voyageurs par défaut</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    ID de l&apos;annonce Airbnb
                  </label>
                  <input
                    type="text"
                    value={settings.airbnb.listingId}
                    onChange={(e) => updateSetting('airbnb', 'listingId', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  />
                  <p className="text-stone-400 text-xs mt-1">
                    Trouvable dans l&apos;URL de votre annonce
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl text-text">Contact</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Numéro WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.contact.whatsapp}
                  onChange={(e) => updateSetting('contact', 'whatsapp', e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  placeholder="33612345678"
                />
                <p className="text-stone-400 text-xs mt-1">
                  Format international sans le + (ex: 33612345678)
                </p>
              </div>
            </div>

            {/* Bouton Sauvegarder */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${saveStatus === 'saved'
                    ? 'bg-green-500 text-white'
                    : saveStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gold text-white hover:bg-gold-dark'}
                  disabled:opacity-50
                `}
              >
                <Save className="h-5 w-5" />
                {saveStatus === 'saving' && 'Enregistrement...'}
                {saveStatus === 'saved' && 'Enregistré !'}
                {saveStatus === 'error' && 'Erreur'}
                {saveStatus === 'idle' && 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        )}
      </Container>
      </div>
    </div>
  );
}
