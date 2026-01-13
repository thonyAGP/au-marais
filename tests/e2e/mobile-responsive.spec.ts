import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Tests', () => {

  test.describe('Homepage', () => {

    test('Hero title "Au Marais" should not wrap to multiple lines', async ({ page }) => {
      await page.goto('/fr');

      // Wait for the title to be visible
      const heroTitle = page.locator('h1').first();
      await expect(heroTitle).toBeVisible();

      // Get the bounding box to check if text wraps
      const boundingBox = await heroTitle.boundingBox();
      expect(boundingBox).toBeTruthy();

      // The title should have a reasonable height (not wrapped)
      // A single line title should be less than 200px tall even on large screens
      if (boundingBox) {
        // On mobile (small screens), font is smaller so height should be reasonable
        // If text wraps, height would be much larger
        const viewport = page.viewportSize();
        const maxExpectedHeight = viewport && viewport.width < 768 ? 120 : 200;

        expect(boundingBox.height).toBeLessThan(maxExpectedHeight);
      }

      // Take a screenshot for visual verification
      await page.screenshot({
        path: `./tests/e2e/screenshots/hero-title-${test.info().project.name}.png`,
        fullPage: false
      });
    });

    test('Hero section should be fully visible', async ({ page }) => {
      await page.goto('/fr');

      // Check hero section is visible
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // Check subtitle is visible
      const subtitle = page.locator('text=Appartement de charme').first();
      await expect(subtitle).toBeVisible();

      // Check CTA buttons in Hero section are visible (not navigation links)
      // Wait for animations to complete
      await page.waitForTimeout(1500);

      // Target buttons within the Hero section specifically
      const heroButtons = heroSection.locator('button, a.bg-gold');
      await expect(heroButtons.first()).toBeVisible();
    });

    test('Header navigation should work on mobile', async ({ page, isMobile }) => {
      await page.goto('/fr');

      if (isMobile) {
        // Check for hamburger menu on mobile
        const menuButton = page.locator('button[aria-label*="menu"], button:has(svg)').first();

        if (await menuButton.isVisible()) {
          await menuButton.click();

          // Check if mobile menu opens
          await page.waitForTimeout(300); // Wait for animation

          // Take screenshot of open menu
          await page.screenshot({
            path: `./tests/e2e/screenshots/mobile-menu-${test.info().project.name}.png`
          });
        }
      }
    });

    test('No horizontal overflow on homepage', async ({ page }) => {
      await page.goto('/fr');

      // Check that body doesn't have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Appartement Page', () => {

    test('Gallery should be responsive', async ({ page }) => {
      await page.goto('/fr/appartement');

      // Wait for page load
      await page.waitForLoadState('networkidle');

      // Check for images
      const images = page.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);

      // Take screenshot
      await page.screenshot({
        path: `./tests/e2e/screenshots/appartement-${test.info().project.name}.png`,
        fullPage: true
      });
    });

    test('No content overflow', async ({ page }) => {
      await page.goto('/fr/appartement');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Contact Page', () => {

    test('Contact form should be usable on mobile', async ({ page }) => {
      await page.goto('/fr/contact');

      // Check form elements are visible
      const form = page.locator('form').first();

      if (await form.isVisible()) {
        // Check inputs are accessible
        const inputs = form.locator('input, textarea');
        const inputCount = await inputs.count();
        expect(inputCount).toBeGreaterThan(0);

        // Check submit button
        const submitButton = form.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
      }

      await page.screenshot({
        path: `./tests/e2e/screenshots/contact-${test.info().project.name}.png`,
        fullPage: true
      });
    });
  });

  test.describe('Quartier Page', () => {

    test('Map and content should display correctly', async ({ page }) => {
      await page.goto('/fr/quartier');

      await page.waitForLoadState('networkidle');

      // Check main content is visible
      const mainContent = page.locator('main, [role="main"]').first();
      await expect(mainContent).toBeVisible();

      // No horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      await page.screenshot({
        path: `./tests/e2e/screenshots/quartier-${test.info().project.name}.png`,
        fullPage: true
      });
    });
  });

  test.describe('Visual Regression - Full Page Screenshots', () => {

    const pages = [
      { name: 'homepage', path: '/fr' },
      { name: 'appartement', path: '/fr/appartement' },
      { name: 'quartier', path: '/fr/quartier' },
      { name: 'contact', path: '/fr/contact' },
      { name: 'disponibilites', path: '/fr/disponibilites' },
    ];

    for (const pageInfo of pages) {
      test(`Full page screenshot: ${pageInfo.name}`, async ({ page }) => {
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');

        // Wait for any animations to complete
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: `./tests/e2e/screenshots/${pageInfo.name}-${test.info().project.name}.png`,
          fullPage: true
        });
      });
    }
  });
});
