const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3461;
const DIST = path.join(__dirname, 'dist');
const OUT = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

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
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const SUPABASE_URL = 'https://icnbpjkyupuqzuvwuvbk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_W_fG4QxH5XiUuxp7uSW9_A_gDYVEov1';

const mockSupabaseUser = {
  id: 'test-user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-06-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    display_name: 'Test User',
  },
  identities: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

const mockAppUser = {
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

const supabaseSession = JSON.stringify({
  access_token: 'mock-jwt-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: 9999999999,
  token_type: 'bearer',
  user: mockSupabaseUser,
});

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

const routes = [
  { name: 'root', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'forgot-password', path: '/forgot-password' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'paywall', path: '/paywall' },
  { name: 'home', path: '/home' },
  { name: 'focus', path: '/focus' },
  { name: 'progress', path: '/progress' },
  { name: 'profile', path: '/profile' },
  { name: 'settings', path: '/settings' },
  { name: 'settings-account', path: '/settings/account' },
  { name: 'settings-notifications', path: '/settings/notifications' },
  { name: 'settings-privacy', path: '/settings/privacy' },
  { name: 'settings-appearance', path: '/settings/appearance' },
  { name: 'settings-coach', path: '/settings/coach' },
  { name: 'settings-lane-mode', path: '/settings/lane-mode' },
  { name: 'session-setup', path: '/session/setup' },
  { name: 'session-history', path: '/session/history' },
  { name: 'boss', path: '/boss' },
  { name: 'coach', path: '/coach' },
  { name: 'study', path: '/study' },
  { name: 'challenges', path: '/challenges' },
  { name: 'focus-score', path: '/focus-score' },
  { name: 'comeback', path: '/comeback' },
  { name: 'vault', path: '/vault' },
  { name: 'search', path: '/search' },
  { name: 'rivals', path: '/rivals' },
  { name: 'notifications', path: '/notifications' },
  { name: 'achievements', path: '/achievements' },
  { name: 'mastery', path: '/mastery' },
  { name: 'memory-console', path: '/memory-console' },
  { name: 'analytics', path: '/analytics' },
  { name: 'streak-funeral', path: '/streak-funeral' },
  { name: 'companion-detail', path: '/companion-detail' },
];

server.listen(PORT, async () => {
  console.log(`Serving at http://localhost:${PORT}`);
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });

    // Mock all Supabase requests at context level
    await context.route(`${SUPABASE_URL}/**/*`, async (route, request) => {
      const url = request.url();
      const method = request.method();

      if (url.includes('/auth/v1/user')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSupabaseUser),
        });
      }

      if (url.includes('/auth/v1/token')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ access_token: 'mock-jwt-token', refresh_token: 'mock-refresh', expires_in: 3600, expires_at: 9999999999, token_type: 'bearer', user: mockSupabaseUser }),
        });
      }

      if (url.includes('/auth/v1/session')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ access_token: 'mock-jwt-token', refresh_token: 'mock-refresh', expires_in: 3600, expires_at: 9999999999, token_type: 'bearer', user: mockSupabaseUser }),
        });
      }

      if (url.includes('/rest/v1/users')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ onboarding_completed_at: '2024-01-01T00:00:00Z' }]),
        });
      }

      if (url.includes('/rest/v1/')) {
        // Generic empty response for any table
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        });
      }

      // Let other Supabase requests pass (RPC, storage, etc.)
      route.continue();
    });

    for (const route of routes) {
      const page = await context.newPage();
      try {
        // Inject mock state before page scripts run
        await page.addInitScript(({ auth, onboarding, user, session, profile }) => {
          localStorage.setItem('zustand-storage\\auth-storage', auth);
          localStorage.setItem('zustand-storage\\onboarding-storage', onboarding);
          sessionStorage.setItem('vex_secure_vex_user_profile', profile);
          sessionStorage.setItem('vex_secure_sb-icnbpjkyupuqzuvwuvbk.supabase.co-auth-token', session);
          sessionStorage.setItem('vex_secure_sb-icnbpjkyupuqzuvwuvbk-auth-token', session);
          window.__mocked = true;
        }, { auth: authStorage, onboarding: onboardingStorage, user: JSON.stringify(mockAppUser), session: supabaseSession, profile: JSON.stringify(mockAppUser) });

        const url = `http://localhost:${PORT}/#${route.path}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(5000); // wait for auth check + React mount + data loading

        const filePath = path.join(OUT, `${route.name}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`✅ ${route.name}: ${filePath}`);
      } catch (err) {
        console.error(`❌ ${route.name}: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    console.log(`\nDone. Screenshots saved to ${OUT}`);
  } catch (e) {
    console.error('Failed:', e.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
