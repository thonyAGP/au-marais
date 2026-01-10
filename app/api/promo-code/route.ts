import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface PromoCode {
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
  minNights: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

interface PromoCodesData {
  codes: Record<string, PromoCode>;
  settings: {
    allowStacking: boolean;
    caseInsensitive: boolean;
  };
}

const PROMO_CODES_PATH = path.join(process.cwd(), 'data', 'promo-codes.json');

const getPromoCodes = async (): Promise<PromoCodesData> => {
  try {
    const data = await fs.readFile(PROMO_CODES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      codes: {},
      settings: { allowStacking: false, caseInsensitive: true },
    };
  }
};

interface ValidationRequest {
  code: string;
  nights?: number;
  totalPrice?: number;
}

interface ValidationResponse {
  valid: boolean;
  code?: string;
  discount?: number;
  type?: 'percent' | 'fixed';
  description?: string;
  discountAmount?: number;
  error?: string;
}

// POST - Validate a promo code
export async function POST(request: NextRequest): Promise<NextResponse<ValidationResponse>> {
  try {
    const body: ValidationRequest = await request.json();
    const { code, nights = 0, totalPrice = 0 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code manquant' }, { status: 400 });
    }

    const promoData = await getPromoCodes();
    const { codes, settings } = promoData;

    // Find the code (case insensitive if configured)
    const normalizedCode = settings.caseInsensitive ? code.toUpperCase() : code;
    const promoCode = codes[normalizedCode];

    if (!promoCode) {
      return NextResponse.json({ valid: false, error: 'Code invalide' });
    }

    // Check if code is active
    if (!promoCode.active) {
      return NextResponse.json({ valid: false, error: 'Ce code n\'est plus actif' });
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(promoCode.validFrom);
    const validUntil = new Date(promoCode.validUntil);

    if (now < validFrom) {
      return NextResponse.json({ valid: false, error: 'Ce code n\'est pas encore valide' });
    }

    if (now > validUntil) {
      return NextResponse.json({ valid: false, error: 'Ce code a expiré' });
    }

    // Check max uses
    if (promoCode.maxUses !== null && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json({ valid: false, error: 'Ce code a atteint sa limite d\'utilisation' });
    }

    // Check minimum nights
    if (nights > 0 && nights < promoCode.minNights) {
      return NextResponse.json({
        valid: false,
        error: `Ce code nécessite un minimum de ${promoCode.minNights} nuits`,
      });
    }

    // Calculate discount amount if total price provided
    let discountAmount = 0;
    if (totalPrice > 0) {
      if (promoCode.type === 'percent') {
        discountAmount = Math.round(totalPrice * (promoCode.discount / 100));
      } else {
        discountAmount = promoCode.discount;
      }
    }

    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      discount: promoCode.discount,
      type: promoCode.type,
      description: promoCode.description,
      discountAmount,
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - List all active promo codes (admin only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const promoData = await getPromoCodes();
  return NextResponse.json(promoData);
}
