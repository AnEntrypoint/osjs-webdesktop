const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test('test window opening after login', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.waitForSelector('#osjs-login', { timeout: 5000 });
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(3000);

  console.log('Attempting to open text editor...');

  const result = await page.evaluate(() => {
    if (typeof window.openTextEditor === 'function') {
      window.openTextEditor();
      return 'Function called';
    }
    return 'Function not found';
  });

  console.log('Result:', result);

  await page.waitForTimeout(2000);

  const windows = await page.locator('.osjs-window').count();
  console.log('Windows found:', windows);

  const hasWindow = await page.evaluate(() => {
    const win = document.querySelector('.osjs-window');
    return {
      exists: !!win,
      html: win ? win.outerHTML.substring(0, 500) : 'none'
    };
  });

  console.log('Window check:', JSON.stringify(hasWindow, null, 2));

  await page.screenshot({
    path: '/tmp/osjs-window-test.jpeg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  expect(windows).toBeGreaterThan(0);
});
