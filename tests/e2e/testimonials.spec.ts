import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour le système de témoignages V2
 * - Formulaire de soumission de témoignages
 * - Affichage des témoignages natifs
 * - Interface d'administration
 */
test.describe('Testimonials System V2', () => {
  test.describe('Testimonial Form Page', () => {
    test('Form page should load correctly in French', async ({ page }) => {
      await page.goto('/fr/temoignage');
      await page.waitForLoadState('domcontentloaded');

      // Check page title
      const h1 = page.locator('h1');
      await expect(h1).toContainText('témoignage');

      // Check form exists
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('Form page should load in all 6 languages', async ({ page }) => {
      const languages = ['fr', 'en', 'es', 'de', 'pt', 'zh'];

      for (const lang of languages) {
        await page.goto(`/${lang}/temoignage`);
        await page.waitForLoadState('domcontentloaded');

        // Check form exists
        const form = page.locator('form');
        await expect(form).toBeVisible();

        // Check all required form fields exist
        const nameInput = page.locator('input#authorName');
        const locationInput = page.locator('input#authorLocation');
        const textArea = page.locator('textarea#text');
        const submitButton = page.locator('button[type="submit"]');

        await expect(nameInput).toBeVisible();
        await expect(locationInput).toBeVisible();
        await expect(textArea).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test('Form should have required fields validation', async ({ page }) => {
      await page.goto('/fr/temoignage');
      await page.waitForLoadState('domcontentloaded');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');

      // Button should be disabled when text is too short
      await expect(submitButton).toBeDisabled();

      // Fill name but not text
      await page.fill('input#authorName', 'Test User');
      await expect(submitButton).toBeDisabled();

      // Fill text with less than 10 characters
      await page.fill('textarea#text', 'Short');
      await expect(submitButton).toBeDisabled();

      // Fill text with 10+ characters
      await page.fill('textarea#text', 'This is a test testimonial with more than 10 characters.');
      await expect(submitButton).toBeEnabled();
    });

    test('Star rating should be interactive', async ({ page }) => {
      await page.goto('/fr/temoignage');
      await page.waitForLoadState('domcontentloaded');

      // Find star buttons (5 stars)
      const starButtons = page.locator('button').filter({ has: page.locator('svg.text-gold, svg.text-stone-300') });

      // Should have 5 star buttons
      await expect(starButtons).toHaveCount(5);

      // Click on 3rd star
      await starButtons.nth(2).click();

      // Check rating display shows 3/5
      const ratingDisplay = page.locator('text=3/5');
      await expect(ratingDisplay).toBeVisible();
    });

    // Note: This test may be flaky on WebKit desktop/tablet due to route mocking timing
    // Works reliably on Chromium (Chrome, Pixel) and WebKit mobile (iPhone)
    test('Form should show success message after submission', async ({ page }) => {
      // This test uses API mocking for the submission
      // Setup route BEFORE navigation for WebKit compatibility
      await page.route('**/api/testimonials', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Testimonial submitted for review',
              testimonial: { id: 'test-123', status: 'pending' },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/fr/temoignage');
      await page.waitForLoadState('networkidle');

      // Fill the form
      await page.fill('input#authorName', 'Test User');
      await page.fill('input#authorLocation', 'Paris, France');
      await page.fill('textarea#text', 'This is a wonderful test testimonial for E2E testing purposes.');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for success message (increased timeout for Safari)
      await expect(page.locator('text=Merci')).toBeVisible({ timeout: 10000 });
    });

    // Note: This test may be flaky on WebKit desktop/tablet due to route mocking timing
    // Works reliably on Chromium (Chrome, Pixel) and WebKit mobile (iPhone)
    test('Form should show error on API failure', async ({ page }) => {
      // Mock API error - setup route BEFORE navigation for WebKit
      await page.route('**/api/testimonials', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/fr/temoignage');
      await page.waitForLoadState('networkidle');

      // Fill the form
      await page.fill('input#authorName', 'Test User');
      await page.fill('textarea#text', 'This is a test testimonial text.');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for error message (increased timeout for Safari)
      await expect(page.locator('text=Erreur')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Native Testimonials Display', () => {
    test('Native testimonials section should render on homepage when data exists', async ({
      page,
    }) => {
      // Mock API to return testimonials
      await page.route('/api/testimonials*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            testimonials: [
              {
                id: 'test-1',
                text: 'Amazing stay in Paris!',
                rating: 5,
                author: { name: 'John Doe', location: 'New York, USA' },
                publishedAt: '2025-01-10T12:00:00Z',
                source: 'native',
              },
              {
                id: 'test-2',
                text: 'Beautiful apartment in Le Marais.',
                rating: 4,
                author: { name: 'Jane Smith', location: 'London, UK' },
                publishedAt: '2025-01-08T10:00:00Z',
                source: 'native',
              },
            ],
            total: 2,
          }),
        });
      });

      await page.goto('/fr');
      await page.waitForLoadState('networkidle');

      // Check native testimonials section exists
      const nativeSection = page.locator('[data-testid="native-testimonials"]');
      await expect(nativeSection).toBeVisible();

      // Check testimonial cards are displayed
      const testimonialTexts = page.locator('text=Amazing stay');
      await expect(testimonialTexts).toBeVisible();
    });

    test('Native testimonials section should NOT render when no data', async ({ page }) => {
      // Mock API to return empty array
      await page.route('/api/testimonials*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ testimonials: [], total: 0 }),
        });
      });

      await page.goto('/fr');
      await page.waitForLoadState('networkidle');

      // Section should not be visible
      const nativeSection = page.locator('[data-testid="native-testimonials"]');
      await expect(nativeSection).not.toBeVisible();
    });

    test('Leave review button should link to testimonial form', async ({ page }) => {
      // Mock API with testimonials
      await page.route('/api/testimonials*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            testimonials: [
              {
                id: 'test-1',
                text: 'Great place to stay!',
                rating: 5,
                author: { name: 'Test User' },
                publishedAt: '2025-01-10T12:00:00Z',
                source: 'native',
              },
            ],
            total: 1,
          }),
        });
      });

      await page.goto('/fr');
      await page.waitForLoadState('networkidle');

      // Find and click the "Leave review" button
      const leaveReviewLink = page.locator('[data-testid="native-testimonials"] a[href*="/temoignage"]');
      await expect(leaveReviewLink).toBeVisible();

      await leaveReviewLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Should navigate to testimonial form
      await expect(page).toHaveURL(/\/fr\/temoignage/);
    });
  });

  // Admin tests require Vercel deployment (KV + proper layouts)
  // Skip in local dev - set CI=true or VERCEL=1 to run
  test.describe('Admin Testimonials Interface', () => {
    const isLocalDev = !process.env.CI && !process.env.VERCEL;
    test.skip(() => isLocalDev, 'Admin tests require Vercel deployment');

    test('Admin page should show login form initially', async ({ page }) => {
      await page.goto('/admin/testimonials');
      await page.waitForLoadState('domcontentloaded');

      // Check login form exists
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();

      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toContainText('Connexion');
    });

    test('Admin page should show error on wrong password', async ({ page }) => {
      // Mock auth endpoint to reject
      await page.route('/api/auth', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid password' }),
        });
      });

      await page.goto('/admin/testimonials');
      await page.waitForLoadState('domcontentloaded');

      // Try wrong password
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=incorrect')).toBeVisible({ timeout: 5000 });
    });

    test('Admin page should load testimonials after successful login', async ({ page }) => {
      const testToken = 'test-admin-token';

      // Mock auth endpoint
      await page.route('/api/auth', async (route) => {
        const method = route.request().method();
        if (method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: testToken }),
          });
        } else if (method === 'GET') {
          const authHeader = route.request().headers()['authorization'];
          if (authHeader === `Bearer ${testToken}`) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ valid: true }),
            });
          } else {
            await route.fulfill({ status: 401 });
          }
        }
      });

      // Mock testimonials endpoint
      await page.route('/api/testimonials*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            testimonials: [
              {
                id: 'pending-1',
                text: 'Pending review text',
                rating: 5,
                status: 'pending',
                author: { name: 'Pending User', location: 'Paris' },
                createdAt: '2025-01-10T12:00:00Z',
              },
            ],
            total: 1,
          }),
        });
      });

      await page.goto('/admin/testimonials');
      await page.waitForLoadState('domcontentloaded');

      // Login
      await page.fill('input[type="password"]', 'correctpassword');
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await expect(page.locator('text=Modération')).toBeVisible({ timeout: 5000 });

      // Check testimonials are displayed
      await expect(page.locator('text=Pending User')).toBeVisible();
    });

    test('Admin should have filter buttons for status', async ({ page }) => {
      const testToken = 'test-admin-token';

      // Mock endpoints
      await page.route('/api/auth', async (route) => {
        const method = route.request().method();
        if (method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: testToken }),
          });
        } else {
          await route.fulfill({ status: 200, body: JSON.stringify({ valid: true }) });
        }
      });

      await page.route('/api/testimonials*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ testimonials: [], total: 0 }),
        });
      });

      await page.goto('/admin/testimonials');

      // Login
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');

      // Wait for dashboard
      await expect(page.locator('text=Modération')).toBeVisible({ timeout: 5000 });

      // Check filter buttons exist
      await expect(page.locator('button:has-text("En attente")')).toBeVisible();
      await expect(page.locator('button:has-text("Approuvé")')).toBeVisible();
      await expect(page.locator('button:has-text("Rejeté")')).toBeVisible();
      await expect(page.locator('button:has-text("Tous")')).toBeVisible();
    });
  });

  // API tests require Vercel KV - skip in local dev
  // Set CI=true or VERCEL=1 to run these tests
  test.describe('API Endpoints', () => {
    const isLocalDev = !process.env.CI && !process.env.VERCEL;
    test.skip(() => isLocalDev, 'API tests require Vercel KV');

    test('GET /api/testimonials should return public testimonials', async ({ request }) => {
      const response = await request.get('/api/testimonials');

      // Should return 200
      expect(response.status()).toBe(200);

      const data = await response.json();

      // Should have testimonials array
      expect(data).toHaveProperty('testimonials');
      expect(Array.isArray(data.testimonials)).toBe(true);
    });

    test('POST /api/testimonials should validate required fields', async ({ request }) => {
      // Missing required fields
      const response = await request.post('/api/testimonials', {
        data: { text: 'short' },
      });

      // Should return 400
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('POST /api/testimonials should accept valid submission', async ({ request }) => {
      const response = await request.post('/api/testimonials', {
        data: {
          authorName: 'E2E Test User',
          authorLocation: 'Test City',
          rating: 5,
          text: 'This is a valid test testimonial submission from E2E tests.',
          language: 'en',
        },
      });

      // Should return 200
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('testimonial');
      expect(data.testimonial).toHaveProperty('id');
    });
  });
});
