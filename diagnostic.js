const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3460;
const DIST = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath) || '.html';
  const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const mockUser = {
  id: 'test-user-123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  squadId: null,
  verified: false,
  role: 'user',
  status: 'active',
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: {
      push: true, email: true, sms: false, inApp: true,
      digestFrequency: 'daily',
      quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' }
    },
    privacy: {
      profileVisibility: 'public', activityStatus: true, readReceipts: true,
      allowTagging: true, allowMentions: true, dataSharing: false
    },
    accessibility: {
      reduceMotion: false, highContrast: false, largeText: false,
      screenReaderOptimized: false
    }
  },
  metadata: { loginCount: 1, deviceHistory: [] },
  onboardingCompletedAt: '2024-01-01T00:00:00Z'
};

const authStorage = JSON.stringify({ state: { isAuthenticated: true }, version: 0 });
const onboardingStorage = JSON.stringify({
  state: {
    isOnboarded: true,
    currentStep: 5,
    goal: 'STUDY',
    focusDuration: 15,
    displayName: 'Test User',
    startedAt: 1700000000000,
    completedAt: 1700000000000,
    completedForUserId: 'test-user-123',
    persona: 'mentor',
    element: 'FLAME',
    motivationProfile: { primary: 'study_focused', secondary: [] },
    explicitMotivationStyle: 'study_focused',
    chosenLane: 'deep_work',
  },
  version: 0
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // Set storage BEFORE navigating
  await page.addInitScript(({ auth, onboarding, user }) => {
    localStorage.setItem('zustand-storage\\auth-storage', auth);
    localStorage.setItem('zustand-storage\\onboarding-storage', onboarding);
    sessionStorage.setItem('vex_secure_vex_user_profile', user);
    // Also expose a flag we can check
    window.__mocked = true;
  }, { auth: authStorage, onboarding: onboardingStorage, user: JSON.stringify(mockUser) });

  await page.goto(`http://localhost:${PORT}/#/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Check what's in storage from page perspective
  const pageStorage = await page.evaluate(() => ({
    localStorageKeys: Object.keys(localStorage),
    localStorageAuth: localStorage.getItem('zustand-storage\\auth-storage'),
    localStorageOnboarding: localStorage.getItem('zustand-storage\\onboarding-storage'),
    sessionStorageProfile: sessionStorage.getItem('vex_secure_vex_user_profile'),
    mocked: (window).__mocked,
    url: window.location.href,
  }));

  console.log('Page storage:', JSON.stringify(pageStorage, null, 2));

  // Check React component tree for clues about current screen
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body text (first 500 chars):', bodyText);

  await page.screenshot({ path: 'diagnostic-home.png' });
  console.log('Saved diagnostic-home.png');

  await browser.close();
  server.close();
  process.exit(0);
});
