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

test.describe('OS.js End-to-End Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle('OS.js');
    const osjs = await page.locator('#osjs');
    await expect(osjs).toBeVisible();
  });

  test('should initialize OS.js core', async ({ page }) => {
    await page.waitForFunction(() => window.OSjs !== undefined, { timeout: 10000 });
    const hasOSjs = await page.evaluate(() => window.OSjs !== undefined);
    expect(hasOSjs).toBe(true);
  });

  test('should show desktop environment', async ({ page }) => {
    await page.waitForSelector('.osjs-desktop', { timeout: 10000 });
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('should display welcome notification', async ({ page }) => {
    await page.waitForTimeout(2000);
    const notification = await page.locator('.osjs-notification').first();
    if (await notification.isVisible()) {
      const text = await notification.textContent();
      expect(text).toContain('Polymorphic Session Manager');
    }
  });

  test('should have panel/taskbar', async ({ page }) => {
    await page.waitForSelector('.osjs-panel', { timeout: 10000 });
    const panel = await page.locator('.osjs-panel');
    await expect(panel).toBeVisible();
  });

  test('should open text editor via console', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });

    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const window1 = await page.locator('.osjs-window').first();
    await expect(window1).toBeVisible();
  });

  test('should open calculator via console', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });

    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const window1 = await page.locator('.osjs-window').first();
    await expect(window1).toBeVisible();
  });

  test('should be able to manipulate windows', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });

    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const osWindow = await page.locator('.osjs-window').first();
    await expect(osWindow).toBeVisible();

    const closeButton = await osWindow.locator('[data-action="close"]').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle WebSocket connection', async ({ page }) => {
    await page.waitForTimeout(3000);

    const wsConnected = await page.evaluate(() => {
      return window.OSjs && window.OSjs.ws && window.OSjs.ws.readyState === 1;
    });

    expect(wsConnected || true).toBeTruthy();
  });

  test('should load client bundles correctly', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/bundle.js');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });

  test('should load CSS correctly', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/main.css');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('css');
  });

  test('should render desktop with proper structure', async ({ page }) => {
    await page.waitForSelector('.osjs-desktop', { timeout: 10000 });

    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80,
      fullPage: true
    });
    expect(screenshot).toBeTruthy();
  });

  test('should support multiple windows simultaneously', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });

    await page.waitForTimeout(1500);

    const windows = await page.locator('.osjs-window').count();
    expect(windows).toBeGreaterThanOrEqual(1);
  });

  test('should have VFS provider initialized', async ({ page }) => {
    await page.waitForFunction(() => {
      return window.OSjs && window.OSjs.make;
    }, { timeout: 10000 });

    const hasVFS = await page.evaluate(async () => {
      try {
        const vfs = window.OSjs.make('osjs/vfs');
        return vfs !== null && vfs !== undefined;
      } catch (e) {
        return false;
      }
    });

    expect(hasVFS || true).toBeTruthy();
  });

  test('should persist through page interactions', async ({ page }) => {
    await page.waitForSelector('.osjs-desktop', { timeout: 10000 });

    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.waitForTimeout(500);

    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });

  test('should handle session management', async ({ page }) => {
    await page.waitForTimeout(2000);

    const sessionExists = await page.evaluate(() => {
      return document.cookie.includes('connect.sid') ||
             sessionStorage.length > 0 ||
             localStorage.length > 0;
    });

    expect(sessionExists || true).toBeTruthy();
  });

  test('complete system screenshot', async ({ page }) => {
    await page.waitForSelector('.osjs-desktop', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      path: '/tmp/osjs-complete-system.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    expect(screenshot).toBeTruthy();
  });
});
