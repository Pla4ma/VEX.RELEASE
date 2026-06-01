const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3458;
const DIST = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath) || '.html';
  const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check localStorage and any global vars
  const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
  const globalKeys = await page.evaluate(() => Object.keys(window).filter(k => k.includes('MMKV') || k.includes('auth') || k.includes('store') || k.includes('vex')));

  console.log('localStorage keys:', localStorageKeys);
  console.log('Global window keys matching:', globalKeys);

  // Try to see if MMKV exists
  const mmkvInfo = await page.evaluate(() => {
    const info = {};
    for (const k of Object.keys(window)) {
      if (k.toLowerCase().includes('mmkv')) {
        info[k] = typeof window[k];
      }
    }
    return info;
  });
  console.log('MMKV-like globals:', mmkvInfo);

  await browser.close();
  server.close();
  process.exit(0);
});
