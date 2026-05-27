/**
 * QA Verification Rules
 *
 * Helper functions and verification data arrays.
 * Extracted from qa-verification.js for file size compliance.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  log(
    `${exists ? '✓' : '✗'} ${description}: ${filePath}`,
    exists ? 'green' : 'red'
  );
  return exists;
}

function grepFiles(pattern, dir, extensions) {
  const results = [];

  function searchDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        searchDir(fullPath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          results.push(fullPath);
        }
      }
    }
  }

  searchDir(dir);
  return results;
}

// Verification data arrays
const criticalFiles = [
  ['src/screens/streaks/StreakFuneralScreen.tsx', 'Streak Funeral Screen'],
  ['src/screens/ComebackScreen.tsx', 'Comeback Screen'],
  ['src/features/boss/components/BossDefeatedScreen.tsx', 'Boss Defeated Screen'],
  ['src/features/spectacle/components/BossDefeatedCeremony.tsx', 'Boss Defeated Ceremony'],
  ['src/features/home-spine/components/ComebackQuestCard.tsx', 'Comeback Quest Card'],
  ['src/features/streaks/components/ComebackQuestCard.tsx', 'Streak Comeback Card'],
];

const phase23Files = [
  ['src/shared/ui/components/WittyLoadingState.tsx', 'Witty Loading States'],
  ['src/features/streaks/components/streak-calendar-enhanced.tsx', 'Enhanced Streak Calendar'],
];

const vexVoiceChecks = [
  ['EmptyFeed', 'is waiting', 'Feed empty state'],
  ['EmptyRivals', 'ghost rivals', 'Rivals empty state'],
  ['EmptyAchievements', 'Yet', 'Achievements empty state'],
  ['EmptyNotifications', 'streak breaking', 'Notifications empty state'],
];

const animatedCounterFiles = [
  'src/features/home-spine/components/StreakWidget.tsx',
  'src/features/economy/components/SimpleWalletBadge.tsx',
];

const errorFiles = [
  ['src/session/components/states/SessionErrorState.tsx', 'Boss Interference'],
  ['src/shared/monetization/components/PurchaseErrorState.tsx', 'VEX lost connection'],
  ['src/components/states/ErrorState.tsx', 'Boss Interference Detected'],
];

const e2eFiles = [
  ['e2e/flows/complete-session-flow.test.ts', 'Complete Session Flow'],
  ['e2e/flows/auth-flow.test.ts', 'Auth Flow'],
  ['e2e/flows/purchase-flow.test.ts', 'Purchase Flow'],
  ['e2e/utils/test-helpers.ts', 'Test Helpers'],
];

const docs = [
  ['docs/QA_TESTING_GUIDE.md', 'QA Testing Guide'],
];

module.exports = {
  colors,
  log,
  checkFileExists,
  grepFiles,
  criticalFiles,
  phase23Files,
  vexVoiceChecks,
  animatedCounterFiles,
  errorFiles,
  e2eFiles,
  docs,
};
