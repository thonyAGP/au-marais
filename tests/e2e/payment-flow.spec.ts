import { test, expect } from '@playwright/test';

test.describe('Payment Flow - Confirmation Page Security', () => {
  test.describe('Token-based access', () => {
    test('should show error when accessing /confirmed without token', async ({ page }) => {
      await page.goto('/reservation/confirmed');
      await page.waitForLoadState('networkidle');

      // Should show invalid link error
      await expect(page.locator('text=Lien invalide')).toBeVisible();
      await expect(page.locator('text=Ce lien de confirmation')).toBeVisible();
    });

    test('should show error with invalid token', async ({ page }) => {
      await page.goto('/reservation/confirmed?token=invalid-token-12345');
      await page.waitForLoadState('networkidle');

      // Should show invalid link error
      await expect(page.locator('text=Lien invalide')).toBeVisible();
    });

    test('should show error with malformed token', async ({ page }) => {
      await page.goto('/reservation/confirmed?token=');
      await page.waitForLoadState('networkidle');

      // Should show invalid link error
      await expect(page.locator('text=Lien invalide')).toBeVisible();
    });

    test('should show success page with valid mock token', async ({ page }) => {
      // Mock the API to return a valid reservation
      await page.route('**/api/reservations/by-confirmation-token**', async (route) => {
        const url = new URL(route.request().url());
        const token = url.searchParams.get('token');

        if (token === 'valid-test-token') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'test-reservation-id',
              firstName: 'Jean',
              arrivalDate: '2026-03-01',
              departureDate: '2026-03-05',
              nights: 4,
              guests: 2,
              total: 1200,
              depositAmount: 400,
              depositPaid: true,
              status: 'paid',
            }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Invalid or expired token' }),
          });
        }
      });

      await page.goto('/reservation/confirmed?token=valid-test-token');
      await page.waitForLoadState('networkidle');

      // Should show success message
      await expect(page.locator('text=Paiement confirmé')).toBeVisible();
      await expect(page.locator('text=Merci pour votre confiance')).toBeVisible();

      // Should show reservation details
      await expect(page.locator('text=Récapitulatif')).toBeVisible();
      await expect(page.locator('text=Arrivée')).toBeVisible();
      await expect(page.locator('text=Départ')).toBeVisible();
    });

    test('should show next steps on success page', async ({ page }) => {
      // Mock the API
      await page.route('**/api/reservations/by-confirmation-token**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-id',
            firstName: 'Test',
            arrivalDate: '2026-03-01',
            departureDate: '2026-03-05',
            nights: 4,
            guests: 2,
            total: 1200,
            depositAmount: 400,
            depositPaid: true,
            status: 'paid',
          }),
        });
      });

      await page.goto('/reservation/confirmed?token=any-valid-token');
      await page.waitForLoadState('networkidle');

      // Should show next steps
      await expect(page.locator('text=Prochaines étapes')).toBeVisible();
      await expect(page.locator('text=Un email de confirmation')).toBeVisible();
      await expect(page.locator('text=informations d\'accès')).toBeVisible();
      await expect(page.locator('text=caution vous sera restituée')).toBeVisible();
    });

    test('should have working home button', async ({ page }) => {
      await page.route('**/api/reservations/by-confirmation-token**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-id',
            firstName: 'Test',
            arrivalDate: '2026-03-01',
            departureDate: '2026-03-05',
            nights: 4,
            guests: 2,
            total: 1200,
            depositAmount: 400,
            depositPaid: true,
            status: 'paid',
          }),
        });
      });

      await page.goto('/reservation/confirmed?token=valid');
      await page.waitForLoadState('networkidle');

      const homeButton = page.locator('text=Retour à l\'accueil');
      await expect(homeButton).toBeVisible();

      // Check href
      const href = await homeButton.getAttribute('href');
      expect(href).toBe('/fr');
    });
  });

  test.describe('Legacy ID support', () => {
    test('should handle legacy ?id= parameter gracefully', async ({ page }) => {
      // Mock the API to return 401 (unauthorized)
      await page.route('**/api/reservations/test-id', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      });

      await page.goto('/reservation/confirmed?id=test-id');
      await page.waitForLoadState('networkidle');

      // Should show generic success (backward compatibility)
      await expect(page.locator('text=Paiement confirmé')).toBeVisible();
    });
  });

  test.describe('Error page styling', () => {
    test('error page should have proper styling', async ({ page }) => {
      await page.goto('/reservation/confirmed');
      await page.waitForLoadState('networkidle');

      // Check error icon is visible
      const errorIcon = page.locator('svg').filter({ has: page.locator('[class*="text-red"]') });
      await expect(errorIcon.first()).toBeVisible();

      // Check dark theme
      const container = page.locator('div').filter({ hasText: 'Lien invalide' }).first();
      await expect(container).toBeVisible();
    });

    test('error page should have reassuring message', async ({ page }) => {
      await page.goto('/reservation/confirmed');
      await page.waitForLoadState('networkidle');

      // Should reassure user about payment
      await expect(
        page.locator('text=Si vous avez effectué un paiement')
      ).toBeVisible();
      await expect(
        page.locator('text=Votre paiement a été enregistré')
      ).toBeVisible();
    });
  });
});

test.describe('Payment API - Confirmation Token Endpoint', () => {
  test('should return 400 without token parameter', async ({ request }) => {
    const response = await request.get('/api/reservations/by-confirmation-token');
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Token required');
  });

  test('should return 404 for invalid token', async ({ request }) => {
    const response = await request.get(
      '/api/reservations/by-confirmation-token?token=nonexistent-token'
    );
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.error).toBe('Invalid or expired token');
  });
});

test.describe('Reservation API - Resend Payment Action', () => {
  test('should return 401 without authentication', async ({ request }) => {
    const response = await request.put('/api/reservations/test-id', {
      data: { action: 'resend_payment' },
    });
    expect(response.status()).toBe(401);
  });
});
