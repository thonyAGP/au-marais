import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { SiteSettings } from '@/types/settings';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS: SiteSettings = {
  discounts: { weekly: 10, biweekly: 15, monthly: 20 },
  airbnb: { nightlyMarkup: 19, cleaningFee: 48, touristTax: 2.88, listingId: '618442543008929958' },
  contact: { whatsapp: '33631598400' },
  emails: {
    fromEmail: 'reservation@au-marais.fr',
    fromName: 'Au Marais',
    adminEmails: ['au-marais@hotmail.com'],
  },
};

const getSettings = async (): Promise<SiteSettings> => {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(data);
    // Merge with defaults to ensure all fields exist (backward compatibility)
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      emails: {
        ...DEFAULT_SETTINGS.emails,
        ...settings.emails,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = async (settings: SiteSettings): Promise<void> => {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
};

// GET - Lecture des paramètres (public)
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

// POST - Mise à jour des paramètres (nécessite auth)
export async function POST(request: NextRequest) {
  // Vérifier le token d'authentification
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const newSettings: SiteSettings = await request.json();

    // Validation basique
    if (
      typeof newSettings.discounts?.weekly !== 'number' ||
      typeof newSettings.discounts?.biweekly !== 'number' ||
      typeof newSettings.discounts?.monthly !== 'number' ||
      typeof newSettings.airbnb?.nightlyMarkup !== 'number' ||
      typeof newSettings.airbnb?.cleaningFee !== 'number' ||
      typeof newSettings.airbnb?.touristTax !== 'number' ||
      typeof newSettings.airbnb?.listingId !== 'string' ||
      typeof newSettings.contact?.whatsapp !== 'string' ||
      typeof newSettings.emails?.fromEmail !== 'string' ||
      typeof newSettings.emails?.fromName !== 'string' ||
      !Array.isArray(newSettings.emails?.adminEmails) ||
      newSettings.emails.adminEmails.length === 0
    ) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    await saveSettings(newSettings);
    return NextResponse.json({ success: true, settings: newSettings });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
