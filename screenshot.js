const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Signup / Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'login.png' });
  
  await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'signup.png' });

  // Go back to login and log in
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'presentationtest2026_run2@example.com');
  await page.type('input[type="password"]', 'Test@123456');
  await page.click('button[type="submit"]');
  
  await page.waitForSelector('.sidebar', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // 2. Dashboard
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'dashboard.png' });

  // 3. Holdings
  await page.goto('http://localhost:5173/holdings', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'holdings.png' });

  // 4. Explore
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'explore.png' });
  
  // 5. Stocks
  await page.goto('http://localhost:5173/stocks', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'stocks.png' });

  // 6. Transactions
  await page.goto('http://localhost:5173/transactions', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'transactions.png' });

  // 7. Profile
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'profile.png' });
  
  // Change password modal
  try {
      await page.click('button:has-text("Change Password")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'change_password.png' });
  } catch (e) {
      console.log("No Change Password button found or timeout.");
  }

  await browser.close();
  console.log("Screenshots captured successfully.");
})();
