'use client';

import { useState, useEffect } from 'react';
import { Container, DevModeBanner } from '@/components/ui';
import { Settings, Percent, Phone, ExternalLink, Save, Mail, Plus, X } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { AdminLogin } from '../AdminLogin';
import { AdminHeader } from '../AdminHeader';
import type { SiteSettings } from '@/types/settings';

export default function AdminSettingsPage() {
  const { isAuthenticated, isLoading, token } = useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (isAuthenticated && token) {
      loadSettings();
    }
  }, [isAuthenticated, token]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch {
      console.error('Erreur lors du chargement des paramètres');
    }
  };

  const handleSave = async () => {
    if (!settings || !token) return;

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

  const addAdminEmail = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      emails: {
        ...settings.emails,
        adminEmails: [...settings.emails.adminEmails, ''],
      },
    });
  };

  const updateAdminEmail = (index: number, value: string) => {
    if (!settings) return;
    const newEmails = [...settings.emails.adminEmails];
    newEmails[index] = value;
    setSettings({
      ...settings,
      emails: {
        ...settings.emails,
        adminEmails: newEmails,
      },
    });
  };

  const removeAdminEmail = (index: number) => {
    if (!settings || settings.emails.adminEmails.length <= 1) return;
    const newEmails = settings.emails.adminEmails.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      emails: {
        ...settings.emails,
        adminEmails: newEmails,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin title="Paramètres" subtitle="Au Marais - Administration" />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <AdminHeader />

      <div className="py-8">
        <Container size="md">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-gold" />
            <div>
              <h1 className="font-serif text-2xl text-text">Paramètres</h1>
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

              {/* Configuration Email */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-gold" />
                  <h2 className="font-serif text-xl text-text">Configuration Email</h2>
                </div>
                <p className="text-text-muted text-sm mb-6">
                  Paramètres pour les notifications email (réservations, paiements).
                </p>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Nom de l&apos;expéditeur
                      </label>
                      <input
                        type="text"
                        value={settings.emails.fromName}
                        onChange={(e) => updateSetting('emails', 'fromName', e.target.value)}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                        placeholder="Au Marais"
                      />
                      <p className="text-stone-400 text-xs mt-1">
                        Nom affiché dans les emails envoyés
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Email expéditeur
                      </label>
                      <input
                        type="email"
                        value={settings.emails.fromEmail}
                        onChange={(e) => updateSetting('emails', 'fromEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                        placeholder="reservation@au-marais.fr"
                      />
                      <p className="text-stone-400 text-xs mt-1">
                        Doit être vérifié dans Resend
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Emails administrateur
                    </label>
                    <p className="text-stone-400 text-xs mb-3">
                      Ces adresses reçoivent les notifications de nouvelles réservations et paiements.
                    </p>
                    <div className="space-y-2">
                      {settings.emails.adminEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => updateAdminEmail(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                            placeholder="email@example.com"
                          />
                          {settings.emails.adminEmails.length > 1 && (
                            <button
                              onClick={() => removeAdminEmail(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addAdminEmail}
                      className="mt-3 flex items-center gap-2 text-gold hover:text-gold-dark transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un email
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Note :</strong> En mode test (environnement de développement),
                      les emails sont envoyés à l&apos;adresse configurée dans <code className="bg-amber-100 px-1 rounded">ADMIN_EMAIL_TEST</code>
                      pour éviter d&apos;envoyer des emails de test aux vraies adresses.
                    </p>
                  </div>
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
