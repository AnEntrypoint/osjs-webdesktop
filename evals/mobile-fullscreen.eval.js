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

test.describe('Mobile Fullscreen Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('windows should be fullscreen on mobile', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const boundingBox = await window.boundingBox();

    expect(boundingBox.x).toBeCloseTo(0, 5);
    expect(boundingBox.y).toBeCloseTo(0, 5);
    expect(boundingBox.width).toBeCloseTo(MOBILE_WIDTH, 5);
    expect(boundingBox.height).toBeCloseTo(MOBILE_HEIGHT - 48, 5);
  });

  test('windows should have fixed positioning', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const position = await window.evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
  });

  test('windows should have no borders', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const borderWidth = await window.evaluate(el =>
      window.getComputedStyle(el).borderWidth
    );
    expect(borderWidth).toBe('0px');
  });

  test('windows should have no border radius', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const borderRadius = await window.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toBe('0px');
  });

  test('multiple windows should all be fullscreen', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window');
    const count = await windows.count();

    for (let i = 0; i < count; i++) {
      const win = windows.nth(i);
      const boundingBox = await win.boundingBox();

      if (boundingBox) {
        expect(boundingBox.width).toBeCloseTo(MOBILE_WIDTH, 5);
        expect(boundingBox.height).toBeCloseTo(MOBILE_HEIGHT - 48, 5);
      }
    }
  });

  test('minimized windows should be hidden', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();

    await window.evaluate(el => {
      el.setAttribute('data-minimized', 'true');
    });

    const display = await window.evaluate(el =>
      window.getComputedStyle(el).display
    );
    expect(display).toBe('none');
  });

  test('windows should cover desktop area except taskbar', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const desktop = await page.locator('.osjs-desktop').first();
    const window = await page.locator('.osjs-window').first();

    const desktopBox = await desktop.boundingBox();
    const windowBox = await window.boundingBox();

    expect(windowBox.y).toBeCloseTo(desktopBox.y, 5);
    expect(windowBox.height).toBeCloseTo(MOBILE_HEIGHT - 48, 5);
  });

  test('window height should be calculated correctly', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const height = await window.evaluate(el =>
      window.getComputedStyle(el).height
    );

    expect(height).toMatch(/calc\(100% - 48px\)|619px/);
  });
});
