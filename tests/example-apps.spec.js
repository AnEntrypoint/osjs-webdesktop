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

test.describe('Text Editor Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should open text editor', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    await expect(win).toBeVisible();

    const title = await win.locator('.osjs-window-title').textContent();
    expect(title).toContain('Text Editor');
  });

  test('text editor should have textarea', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const textarea = await page.locator('.osjs-window textarea').first();
    await expect(textarea).toBeVisible();
  });

  test('text editor should accept input', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const textarea = await page.locator('.osjs-window textarea').first();
    await textarea.fill('Hello, World!');

    const value = await textarea.inputValue();
    expect(value).toBe('Hello, World!');
  });

  test('text editor should have placeholder', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const placeholder = await page.locator('.osjs-window textarea').getAttribute('placeholder');
    expect(placeholder).toContain('Start typing');
  });

  test('text editor should have save button', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const saveButton = await page.locator('.osjs-window button:has-text("Save")').first();
    await expect(saveButton).toBeVisible();
  });

  test('text editor should have monospace font', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const fontFamily = await page.locator('.osjs-window textarea').evaluate(
      el => window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('monospace');
  });

  test('text editor textarea should fill window', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const textareaStyle = await page.locator('.osjs-window textarea').evaluate(el => ({
      width: el.style.width,
      height: el.style.height
    }));

    expect(textareaStyle.width).toBe('100%');
    expect(textareaStyle.height).toBe('100%');
  });

  test('text editor should preserve content on typing', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openTextEditor === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openTextEditor());
    await page.waitForTimeout(1000);

    const textarea = await page.locator('.osjs-window textarea').first();

    await textarea.type('Line 1\n');
    await textarea.type('Line 2\n');
    await textarea.type('Line 3');

    const value = await textarea.inputValue();
    expect(value).toContain('Line 1');
    expect(value).toContain('Line 2');
    expect(value).toContain('Line 3');
  });
});

test.describe('Calculator Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should open calculator', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const win = await page.locator('.osjs-window').first();
    await expect(win).toBeVisible();

    const title = await win.locator('.osjs-window-title').textContent();
    expect(title).toContain('Calculator');
  });

  test('calculator should have display', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const display = await page.locator('.osjs-window .calc-display').first();
    await expect(display).toBeVisible();
  });

  test('calculator display should show 0 initially', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('0');
  });

  test('calculator should have number buttons', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    for (let i = 0; i <= 9; i++) {
      const button = await page.locator(`.osjs-window button:has-text("${i}")`).first();
      await expect(button).toBeVisible();
    }
  });

  test('calculator should have operator buttons', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const operators = ['+', '-', '*', '/', '=', 'C'];
    for (const op of operators) {
      const button = await page.locator(`.osjs-window button:has-text("${op}")`).first();
      await expect(button).toBeVisible();
    }
  });

  test('calculator should input numbers', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("5")').click();
    await page.locator('.osjs-window button:has-text("3")').click();

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('53');
  });

  test('calculator should perform addition', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("5")').click();
    await page.locator('.osjs-window button:has-text("+")').click();
    await page.locator('.osjs-window button:has-text("3")').click();
    await page.locator('.osjs-window button:has-text("=")').click();

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('8');
  });

  test('calculator should perform subtraction', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("9")').click();
    await page.locator('.osjs-window button:has-text("-")').click();
    await page.locator('.osjs-window button:has-text("4")').click();
    await page.locator('.osjs-window button:has-text("=")').click();

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('5');
  });

  test('calculator should perform multiplication', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("6")').click();
    await page.locator('.osjs-window button:has-text("*")').click();
    await page.locator('.osjs-window button:has-text("7")').click();
    await page.locator('.osjs-window button:has-text("=")').click();

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('42');
  });

  test('calculator should perform division', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("8")').click();
    await page.locator('.osjs-window button:has-text("/")').click();
    await page.locator('.osjs-window button:has-text("2")').click();
    await page.locator('.osjs-window button:has-text("=")').click();

    const value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('4');
  });

  test('calculator should clear display', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("5")').click();
    await page.locator('.osjs-window button:has-text("5")').click();

    let value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('55');

    await page.locator('.osjs-window button:has-text("C")').click();

    value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('0');
  });

  test('calculator should chain operations', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    await page.locator('.osjs-window button:has-text("2")').click();
    await page.locator('.osjs-window button:has-text("+")').click();
    await page.locator('.osjs-window button:has-text("3")').click();
    await page.locator('.osjs-window button:has-text("*")').click();

    let value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('5');

    await page.locator('.osjs-window button:has-text("4")').click();
    await page.locator('.osjs-window button:has-text("=")').click();

    value = await page.locator('.osjs-window .calc-display').inputValue();
    expect(value).toBe('20');
  });

  test('calculator display should be right-aligned', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const textAlign = await page.locator('.osjs-window .calc-display').evaluate(
      el => el.style.textAlign
    );
    expect(textAlign).toBe('right');
  });

  test('calculator buttons should be in grid', async ({ page }) => {
    await page.waitForFunction(() => typeof window.openCalculator === 'function', { timeout: 10000 });
    await page.evaluate(() => window.openCalculator());
    await page.waitForTimeout(1000);

    const buttons = await page.locator('.osjs-window button').count();
    expect(buttons).toBe(16);
  });
});

test.describe('App Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await loginToOSjs(page);
    await waitForDesktop(page);
  });

  test('should open both apps simultaneously', async ({ page }) => {
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
    expect(windows).toBeGreaterThanOrEqual(2);
  });

  test('both apps should be functional simultaneously', async ({ page }) => {
    await page.waitForFunction(() => {
      return typeof window.openTextEditor === 'function' &&
             typeof window.openCalculator === 'function';
    }, { timeout: 10000 });

    await page.evaluate(() => {
      window.openTextEditor();
      window.openCalculator();
    });
    await page.waitForTimeout(1500);

    const textareas = await page.locator('.osjs-window textarea');
    if (await textareas.count() > 0) {
      await textareas.first().fill('Testing both apps');
    }

    const calcDisplay = await page.locator('.osjs-window .calc-display');
    if (await calcDisplay.count() > 0) {
      await page.locator('.osjs-window button:has-text("7")').click();
      const value = await calcDisplay.inputValue();
      expect(value).toBe('7');
    }
  });

  test('screenshot with both apps open', async ({ page }) => {
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
      path: '/tmp/osjs-both-apps.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    expect(screenshot).toBeTruthy();
  });
});
