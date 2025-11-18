const { test } = require('@playwright/test');

test('inspect window object', async ({ page }) => {
  await page.goto('http://localhost:8000');

  await page.waitForSelector('#osjs-login', { timeout: 5000 });
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(4000);

  const windowInfo = await page.evaluate(() => {
    try {
      const osjs = window.OSjs;
      const win = osjs.make('osjs/window', {
        title: 'Test Window',
        dimension: { width: 400, height: 300 }
      });

      return {
        windowCreated: !!win,
        hasContent: !!win.$content,
        windowKeys: Object.keys(win || {}).slice(0, 20),
        contentValue: win.$content,
        elementValue: win.$element,
        hasRender: typeof win.render === 'function'
      };
    } catch (err) {
      return {
        error: err.message,
        stack: err.stack
      };
    }
  });

  console.log('\n=== WINDOW OBJECT INFO ===');
  console.log(JSON.stringify(windowInfo, null, 2));
});
