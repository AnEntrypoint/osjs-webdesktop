const { test, expect } = require('@playwright/test');

test('test rendering window first', async ({ page }) => {
  await page.goto('http://localhost:8000');

  await page.waitForSelector('#osjs-login', { timeout: 5000 });
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(4000);

  const result = await page.evaluate(() => {
    try {
      const osjs = window.OSjs;
      const win = osjs.make('osjs/window', {
        title: 'Test Window',
        dimension: { width: 400, height: 300 }
      });

      const beforeRender = {
        hasContent: !!win.$content
      };

      win.render();

      const afterRender = {
        hasContent: !!win.$content,
        contentTag: win.$content?.tagName
      };

      if (win.$content) {
        const div = document.createElement('div');
        div.textContent = 'Hello World!';
        win.$content.appendChild(div);
      }

      return { beforeRender, afterRender, success: !!win.$content };
    } catch (err) {
      return { error: err.message };
    }
  });

  console.log('\n=== RENDER TEST ===');
  console.log(JSON.stringify(result, null, 2));

  await page.waitForTimeout(1000);

  const windowCount = await page.locator('.osjs-window').count();
  console.log('Windows visible:', windowCount);

  await page.screenshot({
    path: '/tmp/osjs-render-test.jpeg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  expect(result.success).toBe(true);
  expect(windowCount).toBeGreaterThan(0);
});
