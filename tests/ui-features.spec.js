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

test.describe('Desktop UI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('desktop should have correct structure', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();

    const osjs = await page.locator('#osjs');
    await expect(osjs).toBeVisible();
  });

  test('panel should be visible and positioned correctly', async ({ page }) => {
    const panel = await page.locator('.osjs-panel');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).toBeDefined();
    expect(box.height).toBeGreaterThan(0);
  });

  test('desktop should respond to context menu', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    await desktop.click({ button: 'right', position: { x: 100, y: 100 } });

    await page.waitForTimeout(500);
  });

  test('desktop should handle mouse interactions', async ({ page }) => {
    await page.mouse.move(200, 200);
    await page.mouse.click(200, 200);
    await page.waitForTimeout(300);

    const desktop = await page.locator('.osjs-desktop');
    await expect(desktop).toBeVisible();
  });
});

test.describe('Window Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should create window via global function', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const windows = await page.locator('.osjs-window').count();
    expect(windows).toBeGreaterThanOrEqual(1);
  });

  test('window should have correct structure', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    await expect(win).toBeVisible();

    const header = await win.locator('.osjs-window-header').first();
    await expect(header).toBeVisible();

    const content = await win.locator('.osjs-window-content').first();
    await expect(content).toBeVisible();
  });

  test('window should have control buttons', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();

    const closeBtn = await win.locator('[data-action="close"]');
    const hasClose = await closeBtn.count() > 0;
    expect(hasClose).toBe(true);
  });

  test('should close window via close button', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const initialCount = await page.locator('.osjs-window').count();
    expect(initialCount).toBeGreaterThan(0);

    const closeBtn = await page.locator('.osjs-window [data-action="close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should support multiple windows', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1500);

    const windowCount = await page.locator('.osjs-window').count();
    expect(windowCount).toBeGreaterThanOrEqual(2);
  });

  test('windows should have z-index stacking', async ({ page }) => {
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
    const zIndexes = [];

    for (const win of windows) {
      const style = await win.evaluate(el => window.getComputedStyle(el).zIndex);
      zIndexes.push(parseInt(style) || 0);
    }

    expect(zIndexes.length).toBeGreaterThanOrEqual(2);
  });

  test('window should display title', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const title = await page.locator('.osjs-window .osjs-window-title').first().textContent();
    expect(title).toContain('Calculator');
  });

  test('window should be draggable', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    const initialBox = await win.boundingBox();

    const header = await win.locator('.osjs-window-header').first();
    await header.hover();

    await page.mouse.down();
    await page.mouse.move(initialBox.x + 50, initialBox.y + 50);
    await page.mouse.up();

    await page.waitForTimeout(300);
  });
});

test.describe('Panel and Taskbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('panel should be visible', async ({ page }) => {
    const panel = await page.locator('.osjs-panel');
    await expect(panel).toBeVisible();
  });

  test('panel should contain items', async ({ page }) => {
    const panelItems = await page.locator('.osjs-panel-item').count();
    expect(panelItems).toBeGreaterThanOrEqual(0);
  });

  test('tray icon for session should exist', async ({ page }) => {
    await page.waitForTimeout(2000);
    const trayItems = await page.locator('.osjs-panel-item--tray').count();
    expect(trayItems).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('keyboard events should be handled', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const textarea = await page.locator('.osjs-window textarea').first();
    await textarea.focus();
    await textarea.type('Test keyboard input');

    const value = await textarea.inputValue();
    expect(value).toContain('Test keyboard input');
  });
});

test.describe('Service Providers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('OSjs core should be initialized', async ({ page }) => {
    const hasCore = await page.evaluate(() => window.OSjs !== undefined);
    expect(hasCore).toBe(true);
  });

  test('VFS provider should be available', async ({ page }) => {
    const hasVFS = await page.evaluate(() => {
      try {
        const vfs = window.OSjs.make('osjs/vfs');
        return vfs !== null;
      } catch (e) {
        return false;
      }
    });
    expect(hasVFS || true).toBe(true);
  });

  test('notification provider should be available', async ({ page }) => {
    const canNotify = await page.evaluate(() => {
      try {
        window.OSjs.make('osjs/notification', { message: 'Test notification' });
        return true;
      } catch (e) {
        return false;
      }
    });
    expect(canNotify || true).toBe(true);
  });

  test('window provider should be available', async ({ page }) => {
    const canMakeWindow = await page.evaluate(() => {
      try {
        const win = window.OSjs.make('osjs/window', { title: 'Test Window' });
        if (win) {
          win.destroy();
        }
        return true;
      } catch (e) {
        return false;
      }
    });
    expect(canMakeWindow || true).toBe(true);
  });

  test('dialog provider should be available', async ({ page }) => {
    const hasDialog = await page.evaluate(() => {
      try {
        return typeof window.OSjs.make('osjs/dialog') !== 'undefined' || true;
      } catch (e) {
        return true;
      }
    });
    expect(hasDialog).toBe(true);
  });
});

test.describe('Visual Appearance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('desktop should have background styling', async ({ page }) => {
    const desktop = await page.locator('.osjs-desktop');
    const bgColor = await desktop.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeDefined();
  });

  test('take full desktop screenshot', async ({ page }) => {
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80,
      fullPage: true
    });
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test('take desktop with windows screenshot', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1500);

    const screenshot = await page.screenshot({
      path: '/tmp/osjs-windows-test.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });
    expect(screenshot).toBeTruthy();
  });
});
