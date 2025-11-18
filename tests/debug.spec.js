const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test('debug client initialization', async ({ page }) => {
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.goto(BASE_URL);

  await page.waitForTimeout(8000);

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(err => console.log(err));
  } else {
    console.log('No errors detected');
  }

  const state = await page.evaluate(() => {
    return {
      hasOSjs: typeof window.OSjs !== 'undefined',
      osjsKeys: window.OSjs ? Object.keys(window.OSjs).slice(0, 20) : [],
      hasDesktop: !!document.querySelector('.osjs-desktop'),
      hasPanel: !!document.querySelector('.osjs-panel'),
      bodyHTML: document.body.innerHTML.substring(0, 2000),
      errorInWindow: window.lastError || 'none'
    };
  });

  console.log('\n=== PAGE STATE ===');
  console.log(JSON.stringify(state, null, 2));

  await page.screenshot({
    path: '/tmp/osjs-debug.jpeg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });
});
