const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test.describe('Diagnostic Tests', () => {

  test('capture initial page state', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForTimeout(5000);

    await page.screenshot({
      path: '/tmp/osjs-diagnostic-initial.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    const html = await page.content();
    console.log('Page title:', await page.title());
    console.log('HTML length:', html.length);

    const bodyText = await page.locator('body').textContent();
    console.log('Body text:', bodyText.substring(0, 500));

    const scripts = await page.locator('script').count();
    console.log('Number of script tags:', scripts);

    const hasOsjsDiv = await page.locator('#osjs').count();
    console.log('Has #osjs div:', hasOsjsDiv);

    const osjsContent = await page.evaluate(() => {
      const div = document.getElementById('osjs');
      return {
        hasDiv: !!div,
        innerHTML: div ? div.innerHTML.substring(0, 1000) : 'N/A',
        childCount: div ? div.children.length : 0
      };
    });
    console.log('OSjs div content:', osjsContent);

    const windowProps = await page.evaluate(() => {
      return {
        hasOSjs: typeof window.OSjs !== 'undefined',
        hasOpenTextEditor: typeof window.openTextEditor !== 'undefined',
        hasOpenCalculator: typeof window.openCalculator !== 'undefined',
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('os') || k.includes('open'))
      };
    });
    console.log('Window properties:', windowProps);

    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    await page.waitForTimeout(2000);

    console.log('Console messages:', consoleMessages.slice(0, 10));
  });

  test('check for errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    console.log('Page errors:', errors);

    await page.screenshot({
      path: '/tmp/osjs-diagnostic-errors.jpeg',
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });
  });
});
