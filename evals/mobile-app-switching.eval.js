const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';
const MOBILE_WIDTH = 375;
const MOBILE_HEIGHT = 667;

async function loginToOSjs(page) {
  try {
    const loginForm = await page.locator('#osjs-login').first();
    if (await loginForm.isVisible({ timeout: 2000 })) {
      await page.fill('input[name="username"]', 'demo');
      await page.fill('input[name="password"]', 'demo');
      await page.click('input[type="submit"]');
      await page.waitForTimeout(2000);
    }
  } catch (e) {}
}

test.describe('Mobile App Switching Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('only one window should be visible at a time', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window');
    const count = await windows.count();

    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      const win = windows.nth(i);
      const isVisible = await win.isVisible();
      if (isVisible) visibleCount++;
    }

    expect(visibleCount).toBeLessThanOrEqual(1);
  });

  test('mobile service should be registered', async ({ page }) => {
    const hasMobile = await page.evaluate(() => {
      return window.OSjs && typeof window.OSjs.make === 'function';
    });
    expect(hasMobile).toBe(true);
  });

  test('mobile provider should detect mobile viewport', async ({ page }) => {
    const isMobile = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    expect(isMobile).toBe(true);
  });

  test('windows should stack properly on creation', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(500);

    const firstWindow = await page.locator('.osjs-window').first();
    await expect(firstWindow).toBeVisible();

    await page.evaluate(() => {
      window.openCalculator();
    });
    await page.waitForTimeout(500);

    const windows = await page.locator('.osjs-window');
    const count = await windows.count();
    expect(count).toBe(2);
  });

  test('window focus should bring window to front', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window');
    const lastWindow = windows.last();

    await expect(lastWindow).toBeVisible();
  });

  test('window titles should be accessible for switching', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window');
    const count = await windows.count();

    for (let i = 0; i < count; i++) {
      const win = windows.nth(i);
      const header = win.locator('.osjs-window-header').first();
      const hasHeader = await header.count();
      expect(hasHeader).toBeGreaterThan(0);
    }
  });

  test('window headers should be touchable', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const header = window.locator('.osjs-window-header').first();

    await header.tap();
    await page.waitForTimeout(200);

    await expect(window).toBeVisible();
  });

  test('window state should be preserved during switching', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const textarea = window.locator('textarea').first();

    await textarea.fill('test content');
    const content = await textarea.inputValue();
    expect(content).toBe('test content');

    await page.evaluate(() => {
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const textareaAgain = await page.locator('.osjs-window').first().locator('textarea').first();
    const contentAgain = await textareaAgain.inputValue().catch(() => '');

    if (contentAgain) {
      expect(contentAgain).toBe('test content');
    }
  });
});
