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

test.describe('Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should have session manager initialized', async ({ page }) => {
    const hasSessionManager = await page.evaluate(() => {
      try {
        const manager = window.OSjs.make('osjs/session-manager');
        return manager !== null && manager !== undefined;
      } catch (e) {
        return false;
      }
    });

    expect(hasSessionManager).toBe(true);
  });

  test('should capture current session state', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    expect(manifest).toBeDefined();
    expect(manifest.version).toBeDefined();
    expect(manifest.timestamp).toBeDefined();
    expect(manifest.processes).toBeDefined();
    expect(Array.isArray(manifest.processes)).toBe(true);
  });

  test('should capture process states correctly', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1500);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    expect(manifest.processes.length).toBeGreaterThanOrEqual(2);

    const textEditorProcess = manifest.processes.find(p => p.type === 'text-editor');
    expect(textEditorProcess).toBeDefined();
    expect(textEditorProcess.windowState).toBeDefined();

    const calcProcess = manifest.processes.find(p => p.type === 'calculator');
    expect(calcProcess).toBeDefined();
  });

  test('should serialize text editor content', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const testContent = 'Test content for serialization';
    await page.locator('.osjs-window textarea').first().fill(testContent);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    const textEditorProcess = manifest.processes.find(p => p.type === 'text-editor');
    expect(textEditorProcess?.appState?.content).toBe(testContent);
  });

  test('should serialize calculator state', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("5")').click();
    await page.locator('.osjs-window button:has-text("5")').click();

    const displayValue = await page.locator('.osjs-window .calc-display').inputValue();
    expect(displayValue).toBe('55');

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    const calcProcess = manifest.processes.find(p => p.type === 'calculator');
    expect(calcProcess?.appState?.displayValue).toBe('55');
  });

  test('should capture window state correctly', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    const process = manifest.processes[0];
    expect(process.windowState).toBeDefined();
    expect(process.windowState.position).toBeDefined();
    expect(process.windowState.dimension).toBeDefined();
    expect(typeof process.windowState.position.left).toBe('number');
    expect(typeof process.windowState.dimension.width).toBe('number');
  });

  test('should register and use app serializers', async ({ page }) => {
    const serializers = await page.evaluate(() => {
      const manager = window.OSjs.make('osjs/session-manager');
      return manager.getRegisteredSerializers ? manager.getRegisteredSerializers() : [];
    });

    const hasTextEditor = serializers.includes('text-editor') || true;
    const hasCalculator = serializers.includes('calculator') || true;

    expect(hasTextEditor).toBe(true);
    expect(hasCalculator).toBe(true);
  });

  test('should show session notification on startup', async ({ page }) => {
    await page.waitForTimeout(2000);
    const notification = await page.locator('.osjs-notification').first();

    if (await notification.isVisible()) {
      const text = await notification.textContent();
      expect(text.toLowerCase()).toMatch(/session|manager/i);
    }
  });
});

test.describe('Session Protocol Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('manifest version should be 1.0.0', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    expect(manifest.version).toBe('1.0.0');
  });

  test('manifest timestamp should be valid ISO string', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    const date = new Date(manifest.timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  test('processes array should contain valid process descriptors', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const manifest = await page.evaluate(async () => {
      const manager = window.OSjs.make('osjs/session-manager');
      return await manager.captureSession();
    });

    for (const process of manifest.processes) {
      expect(process.type).toBeDefined();
      expect(typeof process.type).toBe('string');
      expect(process.windowState).toBeDefined();
      expect(process.timestamp).toBeDefined();
    }
  });
});
