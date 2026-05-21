const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'docs', 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE = 'http://localhost:3000';

async function screenshot(page, name, url, fullPage = false) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, name),
      fullPage: fullPage,
    });
    console.log('Captured: ' + name);
  } catch (err) {
    console.error('Failed: ' + name + ' - ' + err.message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'fr',
  });
  const page = await context.newPage();

  // Frontend screenshots
  await screenshot(page, 'frontend-homepage.png', BASE + '/', true);
  await screenshot(page, 'frontend-catalog.png', BASE + '/catalog.html', true);
  await screenshot(page, 'frontend-product.png', BASE + '/product.html?id=prod_pack_1', true);
  await screenshot(page, 'frontend-contact.png', BASE + '/contact.html', true);

  // Cart screenshot
  try {
    await page.goto(BASE + '/catalog.html', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.click('#cartBtn');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'frontend-cart.png') });
    console.log('Captured: frontend-cart.png');
  } catch (err) {
    console.error('Failed: frontend-cart.png - ' + err.message);
  }

  // Admin screenshots — login first
  try {
    await page.goto(BASE + '/admin/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const emailInput = await page.$('#loginEmail');
    if (emailInput) {
      const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
      const adminEmail = (envContent.match(/ADMIN_EMAIL=(.+)/) || [])[1]?.trim() || 'admin@benshop.dz';
      const adminPassword = (envContent.match(/ADMIN_PASSWORD=(.+)/) || [])[1]?.trim() || '';

      await page.fill('#loginEmail', adminEmail);
      await page.fill('#loginPassword', adminPassword);
      await page.click('#loginBtn');
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png') });
    console.log('Captured: admin-dashboard.png');

    await page.goto(BASE + '/admin/#/products', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-products.png') });
    console.log('Captured: admin-products.png');

    await page.goto(BASE + '/admin/#/orders', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-orders.png') });
    console.log('Captured: admin-orders.png');

    await page.goto(BASE + '/admin/#/messages', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-messages.png') });
    console.log('Captured: admin-messages.png');
  } catch (err) {
    console.error('Admin screenshots failed: ' + err.message);
  }

  await browser.close();
  console.log('Done!');
})();