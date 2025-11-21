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

test.describe('Responsive Breakpoints Evaluation', () => {
  test('desktop layout at 1024px width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    const topPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).top
    );
    expect(topPosition).toBe('32px');

    const bottomPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).bottom
    );
    expect(bottomPosition).toBe('0px');
  });

  test('mobile layout at 768px width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    const topPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).top
    );
    const bottomPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).bottom
    );

    expect(topPosition).toBe('0px');
    expect(bottomPosition).toBe('48px');
  });

  test('mobile layout at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    const topPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).top
    );
    expect(topPosition).toBe('0px');
  });

  test('breakpoint transition from desktop to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    await page.evaluate(() => {
      window.openTextEditor();
    });
    await page.waitForTimeout(1000);

    let window = await page.locator('.osjs-window').first();
    let position = await window.evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('absolute');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    window = await page.locator('.osjs-window').first();
    position = await window.evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
  });

  test('breakpoint transition from mobile to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    let bottomPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).bottom
    );
    expect(bottomPosition).toBe('48px');

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    bottomPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).bottom
    );
    expect(bottomPosition).toBe('0px');
  });

  test('panel position changes at breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const panel = await page.locator('.osjs-panel').first();
    let panelBox = await panel.boundingBox();
    expect(panelBox.y).toBeCloseTo(0, 5);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    panelBox = await panel.boundingBox();
    expect(panelBox.y).toBeGreaterThan(600);
  });

  test('exact breakpoint at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 769, height: 1024 });
    await page.goto(BASE_URL);
    await loginToOSjs(page);

    const contents = await page.locator('.osjs-contents').first();
    let topPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).top
    );
    expect(topPosition).toBe('32px');

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    topPosition = await contents.evaluate(el =>
      window.getComputedStyle(el).top
    );
    expect(topPosition).toBe('0px');
  });
});
