const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3457;
const DIST = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath) || '.html';
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  console.log(`Serving at http://localhost:${PORT}`);
  try {
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true,
    });
    const context = await browser.newContext({
      viewport: { width: 414, height: 896 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    // iPhone 11 Pro Max viewport
    await page.setViewportSize({ width: 414, height: 896 });
    await page.waitForTimeout(1500);
    // Standard portrait screenshot
    await page.screenshot({ path: 'screenshot-editorial-portrait.png', fullPage: false });
    console.log('Portrait screenshot saved');
    // Tall full-page screenshot
    await page.setViewportSize({ width: 414, height: 1500 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshot-editorial-tall.png', fullPage: false });
    console.log('Tall screenshot saved');
    await browser.close();
  } catch (e) {
    console.error('Screenshot failed:', e.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
