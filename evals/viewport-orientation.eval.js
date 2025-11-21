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
  } catch (e) {}
}

test.describe('Viewport Orientation Evaluation', () => {
  test('portrait mode layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    const boundingBox = await contents.boundingBox();

    expect(boundingBox.width).toBeLessThan(boundingBox.height);
    expect(boundingBox.bottom).toBeCloseTo(667 - 48, 10);
  });

  test('landscape mode layout', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    const boundingBox = await contents.boundingBox();

    expect(boundingBox.width).toBeGreaterThan(boundingBox.height);
  });

  test('orientation change from portrait to landscape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    let window = await page.locator('.osjs-window').first();
    let boundingBox = await window.boundingBox();
    expect(boundingBox.width).toBe(375);

    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    window = await page.locator('.osjs-window').first();
    boundingBox = await window.boundingBox();
    expect(boundingBox.width).toBe(667);
  });

  test('orientation change from landscape to portrait', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    let window = await page.locator('.osjs-window').first();
    let boundingBox = await window.boundingBox();
    expect(boundingBox.height).toBeCloseTo(375 - 48, 5);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    window = await page.locator('.osjs-window').first();
    boundingBox = await window.boundingBox();
    expect(boundingBox.height).toBeCloseTo(667 - 48, 5);
  });

  test('panel remains at bottom in portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const panel = await page.locator('.osjs-panel').first();
    const boundingBox = await panel.boundingBox();

    expect(boundingBox.y + boundingBox.height).toBeCloseTo(667, 10);
  });

  test('panel remains at bottom in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const panel = await page.locator('.osjs-panel').first();
    const boundingBox = await panel.boundingBox();

    expect(boundingBox.y + boundingBox.height).toBeCloseTo(375, 10);
  });

  test('window content adapts to portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const textarea = await page.locator('textarea').first();
    const boundingBox = await textarea.boundingBox();

    expect(boundingBox.width).toBeLessThan(boundingBox.height);
  });

  test('window content adapts to landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    const textarea = await page.locator('textarea').first();
    const boundingBox = await textarea.boundingBox();

    expect(boundingBox.width).toBeGreaterThan(boundingBox.height);
  });
});
