const { test } = require('@playwright/test');

test('inspect DOM after login', async ({ page }) => {
  await page.goto('http://localhost:8000');

  await page.waitForSelector('#osjs-login', { timeout: 5000 });
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(4000);

  const domState = await page.evaluate(() => {
    const getAllElements = () => {
      const body = document.body;
      const elements = {};

      elements.body = {
        children: Array.from(body.children).map(el => ({
          tag: el.tagName,
          id: el.id,
          class: el.className,
          childCount: el.children.length
        }))
      };

      elements.osjs = {
        exists: !!document.getElementById('osjs'),
        innerHTML: document.getElementById('osjs')?.innerHTML || 'not found',
        children: Array.from(document.getElementById('osjs')?.children || []).map(el => ({
          tag: el.tagName,
          id: el.id,
          class: el.className
        }))
      };

      elements.selectors = {
        '.osjs-desktop': !!document.querySelector('.osjs-desktop'),
        '.osjs-panel': !!document.querySelector('.osjs-panel'),
        '.osjs-contents': !!document.querySelector('.osjs-contents'),
        '.osjs-root': !!document.querySelector('.osjs-root')
      };

      elements.panels = Array.from(document.querySelectorAll('.osjs-panel')).map(el => ({
        class: el.className,
        html: el.outerHTML.substring(0, 200)
      }));

      return elements;
    };

    return getAllElements();
  });

  console.log('\n=== DOM STRUCTURE ===');
  console.log(JSON.stringify(domState, null, 2));

  await page.screenshot({
    path: '/tmp/osjs-dom-inspection.jpeg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });
});
