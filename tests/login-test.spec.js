const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test('test with login', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto(BASE_URL);

  await page.waitForSelector('#osjs-login', { timeout: 5000 });
  console.log('Login form detected');

  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo');

  await page.click('input[type="submit"]');
  console.log('Login submitted');

  await page.waitForTimeout(5000);

  const state = await page.evaluate(() => {
    return {
      hasDesktop: !!document.querySelector('.osjs-desktop'),
      hasPanel: !!document.querySelector('.osjs-panel'),
      hasOSjs: typeof window.OSjs !== 'undefined',
      hasOpenTextEditor: typeof window.openTextEditor === 'function',
      hasOpenCalculator: typeof window.openCalculator === 'function',
      osjsDiv: document.getElementById('osjs').innerHTML.substring(0, 500)
    };
  });

  console.log('\n=== STATE AFTER LOGIN ===');
  console.log(JSON.stringify(state, null, 2));

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  await page.screenshot({
    path: '/tmp/osjs-after-login.jpeg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  if (state.hasDesktop) {
    console.log('\n✅ SUCCESS: Desktop rendered!');
  } else {
    console.log('\n❌ FAILED: Desktop not rendered');
  }
});
