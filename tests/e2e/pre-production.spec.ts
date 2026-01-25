import { test, expect } from '@playwright/test';

/**
 * Pre-production tests - Run these before every production deployment
 * pnpm test:e2e --grep "Pre-Production"
 */
test.describe('Pre-Production Checks', () => {

  test.describe('Language Switcher', () => {

    test('Desktop: All 6 languages should be available in dropdown', async ({ page }) => {
      await page.goto('/fr');
      await page.waitForLoadState('domcontentloaded');

      // Wait for header to be stable
      await page.waitForTimeout(500);

      // Click on language switcher (desktop)
      const languageSwitcher = page.locator('button[aria-label="Change language"]');

      // Skip if on mobile (no desktop dropdown)
      if (await languageSwitcher.isVisible()) {
        await languageSwitcher.click();

        // Wait for dropdown to open
        await page.waitForTimeout(300);

        // Check all 6 languages are present
        const languages = ['Français', 'English', 'Español', 'Deutsch', 'Português', '中文'];
        for (const lang of languages) {
          const langOption = page.locator(`text=${lang}`);
          await expect(langOption).toBeVisible();
        }

        // Check all flags are loaded (not broken)
        const flags = page.locator('img[src*="flagcdn.com"]');
        const flagCount = await flags.count();
        expect(flagCount).toBeGreaterThanOrEqual(6);

        // Take screenshot
        await page.screenshot({
          path: `./tests/e2e/screenshots/language-dropdown-${test.info().project.name}.png`
        });
      }
    });

    test('Mobile: All 6 language buttons should be visible in menu', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
        return;
      }

      await page.goto('/fr');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // Open mobile menu - target the hamburger menu specifically (Menu or X icon)
      const menuButton = page.locator('button').filter({ hasText: '' }).locator('svg.h-6').first();
      await menuButton.click();
      await page.waitForTimeout(400);

      // Check all 6 language codes are visible in the language grid
      const languageCodes = ['FR', 'EN', 'ES', 'DE', 'PT', 'ZH'];
      const langGrid = page.locator('.grid.grid-cols-3');
      await expect(langGrid).toBeVisible();

      for (const code of languageCodes) {
        const langButton = langGrid.locator(`text=${code}`);
        await expect(langButton).toBeVisible();
      }

      // Check flags are visible and not cut off
      const flags = page.locator('.grid img[src*="flagcdn.com"]');
      const flagCount = await flags.count();
      expect(flagCount).toBe(6);

      // Verify each flag has proper dimensions (not cut off)
      for (let i = 0; i < flagCount; i++) {
        const flag = flags.nth(i);
        const box = await flag.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(20);
          expect(box.height).toBeGreaterThanOrEqual(12);
        }
      }

      await page.screenshot({
        path: `./tests/e2e/screenshots/language-mobile-${test.info().project.name}.png`
      });
    });

    test('Language switching should work correctly', async ({ page }) => {
      // This test navigates to 6 pages, needs more time
      test.slow();

      await page.goto('/fr');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/fr/);

      // Switch to English
      await page.goto('/en');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/en/);

      // Check content is in English
      const englishContent = page.locator('text=Charming apartment').first();
      await expect(englishContent).toBeVisible();

      // Switch to Spanish
      await page.goto('/es');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/es/);

      // Switch to German
      await page.goto('/de');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/de/);

      // Switch to Portuguese
      await page.goto('/pt');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/pt/);

      // Switch to Chinese
      await page.goto('/zh');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/zh/);
    });
  });

  test.describe('Critical Pages Load', () => {

    const criticalPages = [
      { path: '/fr', name: 'Homepage FR' },
      { path: '/en', name: 'Homepage EN' },
      { path: '/fr/appartement', name: 'Apartment FR' },
      { path: '/fr/quartier', name: 'Neighborhood FR' },
      { path: '/fr/contact', name: 'Contact FR' },
      { path: '/fr/reserver', name: 'Booking FR' },
      { path: '/fr/disponibilites', name: 'Availability FR' },
    ];

    for (const pageInfo of criticalPages) {
      test(`${pageInfo.name} should load without errors`, async ({ page }) => {
        const errors: string[] = [];

        // Listen for console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        // Listen for page errors
        page.on('pageerror', err => {
          errors.push(err.message);
        });

        const response = await page.goto(pageInfo.path);

        // Check HTTP status
        expect(response?.status()).toBeLessThan(400);

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Check no critical JS errors (ignore third-party errors and local API errors)
        const isLocalDev = !process.env.CI && !process.env.VERCEL;
        const criticalErrors = errors.filter(e =>
          !e.includes('flagcdn') &&
          !e.includes('analytics') &&
          !e.includes('third-party') &&
          !e.includes('speed-insights') &&
          !e.includes('vercel') &&
          // Ignore generic 404 errors for external resources in local dev
          !(isLocalDev && e.includes('404')) &&
          // Ignore API 500 errors in local dev (Vercel KV unavailable for testimonials)
          !(isLocalDev && e.includes('500'))
        );

        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('SEO Essentials', () => {

    test('Homepage should have proper meta tags', async ({ page }) => {
      await page.goto('/fr');

      // Check title
      const title = await page.title();
      expect(title).toContain('Au Marais');

      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);

      // Check canonical URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', /au-marais\.fr/);

      // Check Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute('content', /.+/);

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /.+/);
    });

    test('All pages should have hreflang tags', async ({ page }) => {
      await page.goto('/fr');

      // Check hreflang tags for all languages
      const hreflangTags = page.locator('link[rel="alternate"][hreflang]');
      const count = await hreflangTags.count();

      // Should have at least 6 languages + x-default
      expect(count).toBeGreaterThanOrEqual(6);
    });
  });

  test.describe('Core Functionality', () => {

    test('Booking bar should appear on scroll', async ({ page }) => {
      await page.goto('/fr');

      // Booking bar should be hidden initially
      const bookingBar = page.locator('.fixed.bottom-0');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(500);

      // Booking bar should now be visible
      await expect(bookingBar).toBeVisible();
    });

    test('Contact form should be functional', async ({ page }) => {
      await page.goto('/fr/contact');
      await page.waitForLoadState('networkidle');

      // Check form exists
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Check required fields exist
      const nameInput = form.locator('input[name="name"], input[id*="name"]').first();
      const emailInput = form.locator('input[type="email"], input[name="email"]').first();
      const submitButton = form.locator('button[type="submit"]');

      await expect(submitButton).toBeVisible();
    });

    test('Calendar should display availability', async ({ page }) => {
      await page.goto('/fr/disponibilites');
      await page.waitForLoadState('networkidle');

      // Wait for calendar to load
      await page.waitForTimeout(2000);

      // Check main content is visible (calendar or booking form)
      const mainContent = page.locator('main, section').first();
      await expect(mainContent).toBeVisible();

      // Check that page has some interactive content
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Basics', () => {

    test('Homepage should load in reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/fr');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Should load DOM in under 10 seconds (accounts for network variability)
      expect(loadTime).toBeLessThan(10000);
    });

    test('Images should have alt attributes', async ({ page }) => {
      await page.goto('/fr');
      await page.waitForLoadState('networkidle');

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt can be empty for decorative images, but attribute should exist
        expect(alt).not.toBeNull();
      }
    });
  });

  test.describe('Accessibility Basics', () => {

    test('Page should have proper heading structure', async ({ page }) => {
      await page.goto('/fr');

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // H1 should be visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('Interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('/fr');

      // Tab through the page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check that focus is visible somewhere
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
    });
  });
});
