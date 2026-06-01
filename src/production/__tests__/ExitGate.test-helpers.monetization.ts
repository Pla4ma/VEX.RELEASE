/**
 * Mock data for ExitGate monetization verifiers: paywall + app store.
 * Also provides shared materials payloads and integration setup helpers.
 */

// ---------------------------------------------------------------------------
// Paywall
// ---------------------------------------------------------------------------

export const greenPaywallResult = {
  passed: true,
  score: 92,
  results: {
    productCatalog: { valid: true, issues: [], warnings: [] },
    purchaseFlow: { valid: true, issues: [], warnings: [] },
    subscriptionManagement: { valid: true, issues: [], warnings: [] },
    receiptValidation: { valid: true, issues: [], warnings: [] },
    analyticsIntegration: { valid: true, issues: [], warnings: [] },
    compliance: { gdprCompliant: true, issues: [], warnings: [] },
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const moderatePaywallResult = {
  passed: true,
  score: 78,
  results: {
    productCatalog: { valid: true, issues: [], warnings: ['Minor catalog issue'] },
    purchaseFlow: { valid: true, issues: [], warnings: [] },
    subscriptionManagement: { valid: true, issues: [], warnings: ['Minor subscription issue'] },
    receiptValidation: { valid: true, issues: [], warnings: [] },
    analyticsIntegration: { valid: true, issues: [], warnings: [] },
    compliance: { gdprCompliant: true, issues: [], warnings: [] },
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const criticalPaywallResult = {
  passed: false,
  score: 65,
  results: {
    productCatalog: { valid: false, issues: ['Critical catalog issue'], warnings: [] },
    purchaseFlow: { valid: false, issues: ['Critical purchase issue'], warnings: [] },
    subscriptionManagement: { valid: true, issues: [], warnings: [] },
    receiptValidation: { valid: true, issues: [], warnings: [] },
    analyticsIntegration: { valid: true, issues: [], warnings: [] },
    compliance: { gdprCompliant: true, issues: [], warnings: [] },
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// App Store — shared materials payload
// ---------------------------------------------------------------------------

export const fullAppStoreMaterials = {
  metadata: {
    appName: 'VEX - Focus & Productivity',
    subtitle: 'Gamified Focus Sessions',
    description: 'Test description',
    keywords: ['focus', 'productivity'],
    category: 'Productivity',
    contentRating: '4+',
    size: '45.2 MB',
    version: '1.0.0',
    buildNumber: '1',
    releaseNotes: 'Test release notes',
  },
  privacyPolicy: { generated: true, content: 'Test privacy policy', lastUpdated: '2024-01-01' },
  termsOfService: { generated: true, content: 'Test terms', lastUpdated: '2024-01-01' },
  screenshots: { iPhone: ['test.png'], iPad: ['test.png'], AppleTV: ['test.png'] },
  appIcon: { generated: true, sizes: { '1024x1024': 'test.png' } },
  testingAccounts: {
    demo: { username: 'test@example.com', password: 'test123', description: 'Test account' },
    premium: { username: 'premium@example.com', password: 'test123', description: 'Premium account' },
  },
  appStoreConnect: {
    appInformation: { 'App Name': 'VEX - Focus & Productivity' },
    pricingAndAvailability: { Price: 'Free' },
    appReviewInformation: { 'Review Notes': 'Test notes' },
  },
};

export const emptyAppStoreMaterials = {
  metadata: {
    appName: '', subtitle: '', description: '', keywords: [], category: '',
    contentRating: '', size: '', version: '', buildNumber: '', releaseNotes: '',
  },
  privacyPolicy: { generated: false, content: '', lastUpdated: '' },
  termsOfService: { generated: false, content: '', lastUpdated: '' },
  screenshots: { iPhone: [], iPad: [], AppleTV: [] },
  appIcon: { generated: false, sizes: {} },
  testingAccounts: {
    demo: { username: '', password: '', description: '' },
    premium: { username: '', password: '', description: '' },
  },
  appStoreConnect: { appInformation: {}, pricingAndAvailability: {}, appReviewInformation: {} },
};

// ---------------------------------------------------------------------------
// App Store results
// ---------------------------------------------------------------------------

export const greenAppStoreResult = {
  ready: true,
  score: 94,
  results: {
    metadata: { complete: true, issues: [], warnings: [] },
    assets: { complete: true, issues: [], warnings: [] },
    privacy: { complete: true, issues: [], warnings: [] },
    compliance: { complete: true, issues: [], warnings: [] },
    testing: { complete: true, issues: [], warnings: [] },
  },
  materials: fullAppStoreMaterials,
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const moderateAppStoreResult = {
  ready: true,
  score: 88,
  results: {
    metadata: { complete: true, issues: [], warnings: ['Minor metadata issue'] },
    assets: { complete: true, issues: [], warnings: ['Minor asset issue'] },
    privacy: { complete: true, issues: [], warnings: [] },
    compliance: { complete: true, issues: [], warnings: [] },
    testing: { complete: true, issues: [], warnings: [] },
  },
  materials: fullAppStoreMaterials,
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const criticalAppStoreResult = {
  ready: false,
  score: 72,
  results: {
    metadata: { complete: false, issues: ['Critical metadata issue'], warnings: [] },
    assets: { complete: false, issues: ['Critical asset issue'], warnings: [] },
    privacy: { complete: true, issues: [], warnings: [] },
    compliance: { complete: true, issues: [], warnings: [] },
    testing: { complete: true, issues: [], warnings: [] },
  },
  materials: emptyAppStoreMaterials,
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};
