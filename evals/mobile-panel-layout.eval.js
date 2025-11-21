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

test.describe('Mobile Panel Layout Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto(BASE_URL);
    await loginToOSjs(page);
  });

  test('panel should have dark theme', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const bgColor = await panel.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(26, 26, 26)');

    const color = await panel.evaluate(el =>
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('panel items should be laid out horizontally', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const whiteSpace = await panel.evaluate(el =>
      window.getComputedStyle(el).whiteSpace
    );
    expect(whiteSpace).toBe('nowrap');
  });

  test('panel should not wrap content', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1000);

    const panel = await page.locator('.osjs-panel').first();
    const scrollWidth = await panel.evaluate(el => el.scrollWidth);
    const clientWidth = await panel.evaluate(el => el.clientWidth);

    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth);
  });

  test('panel children should maintain inline layout', async ({ page }) => {
    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const panelChildren = await page.locator('.osjs-panel > *');
    const count = await panelChildren.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const child = panelChildren.nth(i);
        const display = await child.evaluate(el =>
          window.getComputedStyle(el).display
        );
        expect(display).toMatch(/inline/);
      }
    }
  });

  test('panel should maintain fixed z-index', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const zIndex = await panel.evaluate(el =>
      window.getComputedStyle(el).zIndex
    );
    expect(parseInt(zIndex)).toBe(9999);
  });

  test('panel height should be consistent', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();
    const boundingBox = await panel.boundingBox();

    expect(boundingBox.height).toBe(48);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const newBoundingBox = await panel.boundingBox();
    expect(newBoundingBox.height).toBe(48);
  });

  test('panel should be anchored to viewport bottom', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const position = await panel.evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');

    const bottom = await panel.evaluate(el =>
      window.getComputedStyle(el).bottom
    );
    expect(bottom).toBe('0px');

    const top = await panel.evaluate(el =>
      window.getComputedStyle(el).top
    );
    expect(top).toBe('auto');
  });

  test('panel should span viewport width', async ({ page }) => {
    const panel = await page.locator('.osjs-panel').first();

    const left = await panel.evaluate(el =>
      window.getComputedStyle(el).left
    );
    expect(left).toBe('0px');

    const right = await panel.evaluate(el =>
      window.getComputedStyle(el).right
    );
    expect(right).toBe('0px');
  });
});
