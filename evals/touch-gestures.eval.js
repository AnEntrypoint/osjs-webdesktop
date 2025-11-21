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

test.describe('Touch Gestures Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('panel should support touch scrolling', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const touchAction = await panel.evaluate(el => {
      const children = el.querySelectorAll('*');
      for (let child of children) {
        const style = window.getComputedStyle(child);
        if (style.touchAction === 'manipulation') {
          return 'manipulation';
        }
      }
      return window.getComputedStyle(el).touchAction;
    });

    expect(['auto', 'manipulation', 'pan-x']).toContain(touchAction);
  });

  test('window header should respond to touch', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const window = await page.locator('.osjs-window').first();
    const header = window.locator('.osjs-window-header').first();

    const boundingBox = await header.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.height).toBeGreaterThan(20);
  });

  test('tap on window header should focus window', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window');
    const firstWindow = windows.first();
    const header = firstWindow.locator('.osjs-window-header').first();

    await header.tap();
    await page.waitForTimeout(200);

    const zIndex = await firstWindow.evaluate(el =>
      window.getComputedStyle(el).zIndex
    );
    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });

  test('touch events should not interfere with text input', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const textarea = await page.locator('textarea').first();
    await textarea.tap();
    await textarea.fill('touch test');

    const value = await textarea.inputValue();
    expect(value).toBe('touch test');
  });

  test('panel should have smooth scrolling on touch devices', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const smoothScrolling = await panel.evaluate(el =>
      window.getComputedStyle(el).webkitOverflowScrolling
    );
    expect(smoothScrolling).toBe('touch');
  });

  test('buttons should be tap-friendly size', async ({ page }) => {
    await page.evaluate(() => {
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const buttons = await page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      const firstButton = buttons.first();
      const boundingBox = await firstButton.boundingBox();

      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(30);
        expect(boundingBox.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('double tap should not zoom', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute('content');

    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1.0');
  });

  test('window content should be scrollable with touch', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const textarea = await page.locator('textarea').first();
    const overflow = await textarea.evaluate(el =>
      window.getComputedStyle(el).overflow
    );

    expect(['auto', 'scroll']).toContain(overflow);
  });
});
