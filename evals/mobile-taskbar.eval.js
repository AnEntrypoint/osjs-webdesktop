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

test.describe('Mobile Taskbar Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('taskbar should be positioned at bottom on mobile', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();
    await expect(panel).toBeVisible();

    const boundingBox = await panel.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.y + boundingBox.height).toBeCloseTo(MOBILE_HEIGHT, 10);
  });

  test('taskbar should have fixed height of 48px', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();
    const boundingBox = await panel.boundingBox();
    expect(boundingBox.height).toBe(48);
  });

  test('taskbar should be horizontally scrollable', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const overflowX = await panel.evaluate(el =>
      window.getComputedStyle(el).overflowX
    );
    expect(overflowX).toBe('auto');

    const overflowY = await panel.evaluate(el =>
      window.getComputedStyle(el).overflowY
    );
    expect(overflowY).toBe('hidden');
  });

  test('taskbar should have touch scrolling enabled', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const touchScroll = await panel.evaluate(el =>
      window.getComputedStyle(el).webkitOverflowScrolling
    );
    expect(touchScroll).toBe('touch');
  });

  test('taskbar children should be inline-block', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const panelChildren = await page.locator('.osjs-panel > *');
    const count = await panelChildren.count();

    if (count > 0) {
      const firstChild = panelChildren.first();
      const display = await firstChild.evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(display).toBe('inline-block');
    }
  });

  test('taskbar should span full width', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();
    const boundingBox = await panel.boundingBox();

    expect(boundingBox.width).toBeCloseTo(MOBILE_WIDTH, 5);
    expect(boundingBox.x).toBeCloseTo(0, 5);
  });

  test('taskbar should have dark background', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const bgColor = await panel.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(26, 26, 26)');
  });

  test('taskbar should remain visible when opening windows', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const panel = await page.locator('.osjs-panel').first();
    await expect(panel).toBeVisible();

    const zIndex = await panel.evaluate(el =>
      window.getComputedStyle(el).zIndex
    );
    expect(parseInt(zIndex)).toBe(9999);
  });

  test('taskbar should not overlap with window content', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const panel = await page.locator('.osjs-panel').first();
    const window = await page.locator('.osjs-window').first();

    const panelBox = await panel.boundingBox();
    const windowBox = await window.boundingBox();

    expect(windowBox.y + windowBox.height).toBeLessThanOrEqual(panelBox.y + 5);
  });
});
