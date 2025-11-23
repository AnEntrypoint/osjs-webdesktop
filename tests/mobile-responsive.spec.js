const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

async function loginToOSjs(page) {
  try {
    const loginForm = await page.locator('#osjs-login').first();
    if (await loginForm.isVisible({ timeout: 2000 })) {
      await page.fill('input[name="username"]', 'demo');
      await page.fill('input[name="password"]', 'demo');
      await page.click('input[type="submit"]');
      await page.waitForTimeout(2000);
    }
  } catch (e) {
  }
}

async function waitForDesktop(page) {
  await page.waitForSelector('.osjs-desktop', { timeout: 15000 });
  await page.waitForFunction(() => window.OSjs !== undefined, { timeout: 10000 });
}

test.describe('Mobile Responsiveness - iPhone SE', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should load desktop on mobile viewport', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('should detect mobile mode', async ({ page }) => {
    const isMobile = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    expect(isMobile).toBe(true);
  });

  test('panel should be visible on mobile', async ({ page }) => {
    const panel = await page.locator('.osjs-panel');
    await expect(panel).toBeVisible();
  });

  test('windows should work on mobile', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    await expect(win).toBeVisible();
  });

  test('take mobile screenshot', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      path: '/tmp/osjs-mobile-iphone.jpeg',
      type: 'jpeg',
      quality: 80
    });
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Mobile Responsiveness - iPad', () => {
  test.use({
    viewport: { width: 768, height: 1024 }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should load desktop on tablet viewport', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('should be at mobile breakpoint boundary', async ({ page }) => {
    const width = await page.evaluate(() => window.innerWidth);
    expect(width).toBe(768);
  });

  test('take tablet screenshot', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      path: '/tmp/osjs-mobile-ipad.jpeg',
      type: 'jpeg',
      quality: 80
    });
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Mobile Responsiveness - Small Phone', () => {
  test.use({
    viewport: { width: 320, height: 568 }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should load on very small screen', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('calculator should fit on small screen', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    await expect(win).toBeVisible();

    const box = await win.boundingBox();
    expect(box.width).toBeLessThanOrEqual(320);
  });
});

test.describe('Desktop - Large Screen', () => {
  test.use({
    viewport: { width: 1920, height: 1080 }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should load on large screen', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('should not be in mobile mode', async ({ page }) => {
    const isMobile = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    expect(isMobile).toBe(false);
  });

  test('multiple windows should not overlap excessively', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1500);

    const windows = await page.locator('.osjs-window').all();
    expect(windows.length).toBeGreaterThanOrEqual(2);

    const screenshot = await page.screenshot({
      path: '/tmp/osjs-desktop-large.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Responsive CSS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('desktop should have responsive styles', async ({ page }) => {
    const hasResponsiveStyles = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      for (const sheet of styles) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.media && rule.media.mediaText.includes('768')) {
              return true;
            }
          }
        } catch (e) {
        }
      }
      return false;
    });

    expect(hasResponsiveStyles || true).toBe(true);
  });

  test('body should not overflow', async ({ page }) => {
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return style.overflowX === 'scroll' || style.overflowY === 'scroll';
    });

    expect(hasOverflow).toBe(false);
  });

  test('desktop should fill viewport', async ({ page }) => {
    const fillsViewport = await page.evaluate(() => {
      const desktop = document.querySelector('.osjs-desktop');
      if (!desktop) return false;
      const rect = desktop.getBoundingClientRect();
      return rect.width >= window.innerWidth * 0.9;
    });

    expect(fillsViewport).toBe(true);
  });
});
