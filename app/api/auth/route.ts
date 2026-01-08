import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// POST - Vérifier le mot de passe et retourner un token de session
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Configuration admin manquante' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer un token de session simple
    // En production, utiliser un système plus robuste (JWT, etc.)
    const sessionToken = process.env.ADMIN_SESSION_TOKEN || crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      success: true,
      token: sessionToken,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Vérifier si le token est valide
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
