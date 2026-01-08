import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { SiteSettings } from '@/types/settings';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

const getSettings = async (): Promise<SiteSettings> => {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Retourner les valeurs par défaut si le fichier n'existe pas
    return {
      discounts: { weekly: 10, biweekly: 15, monthly: 20 },
      airbnb: { serviceFee: 15, listingId: '618442543008929958' },
      contact: { whatsapp: '33631598400' },
    };
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
      typeof newSettings.airbnb?.serviceFee !== 'number' ||
      typeof newSettings.airbnb?.listingId !== 'string' ||
      typeof newSettings.contact?.whatsapp !== 'string'
    ) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    await saveSettings(newSettings);
    return NextResponse.json({ success: true, settings: newSettings });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
