/**
 * QA Verification Script
 * Automated checks for Phase 24 regression testing
 * 
 * Run: node scripts/qa-verification.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

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

// ============================================
// VERIFICATION CHECKS
// ============================================

log('\n=== VEX APP - QA VERIFICATION ===\n', 'blue');

let passCount = 0;
let failCount = 0;

// 1. Critical Journey Files
log('1. Critical Journey Files', 'blue');
const criticalFiles = [
  ['src/screens/streaks/StreakFuneralScreen.tsx', 'Streak Funeral Screen'],
  ['src/screens/ComebackScreen.tsx', 'Comeback Screen'],
  ['src/features/boss/components/BossDefeatedScreen.tsx', 'Boss Defeated Screen'],
  ['src/features/spectacle/components/BossDefeatedCeremony.tsx', 'Boss Defeated Ceremony'],
  ['src/features/home-spine/components/ComebackQuestCard.tsx', 'Comeback Quest Card'],
  ['src/features/streaks/components/ComebackQuestCard.tsx', 'Streak Comeback Card'],
];

for (const [file, desc] of criticalFiles) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 2. Phase 23 Components
log('\n2. Phase 23 Polish Components', 'blue');
const phase23Files = [
  ['src/shared/ui/components/WittyLoadingState.tsx', 'Witty Loading States'],
  ['src/features/streaks/components/streak-calendar-enhanced.tsx', 'Enhanced Streak Calendar'],
];

for (const [file, desc] of phase23Files) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 3. Empty States with VEX Voice
log('\n3. VEX Voice Empty States', 'blue');
const emptyStateContent = fs.readFileSync(
  path.join(__dirname, '..', 'src/shared/ui/primitives/EmptyState.tsx'),
  'utf-8'
);

const vexVoiceChecks = [
  ['EmptyFeed', 'is waiting', 'Feed empty state'],
  ['EmptyRivals', 'ghost rivals', 'Rivals empty state'],
  ['EmptyAchievements', 'Yet', 'Achievements empty state'],
  ['EmptyNotifications', 'streak breaking', 'Notifications empty state'],
];

for (const [component, phrase, desc] of vexVoiceChecks) {
  const hasComponent = emptyStateContent.includes(`export function ${component}`);
  const hasPhrase = emptyStateContent.includes(phrase);
  const passed = hasComponent && hasPhrase;
  log(
    `${passed ? '✓' : '✗'} ${desc}: ${component} with "${phrase}"`,
    passed ? 'green' : 'red'
  );
  if (passed) passCount++; else failCount++;
}

// 4. Animated Counter Usage
log('\n4. Animated Counter Integration', 'blue');
const animatedCounterFiles = [
  'src/features/home-spine/components/StreakWidget.tsx',
  'src/features/economy/components/SimpleWalletBadge.tsx',
];

for (const file of animatedCounterFiles) {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
  const hasImport = content.includes('AnimatedCounter');
  const hasUsage = content.includes('<AnimatedCounter');
  const passed = hasImport && hasUsage;
  log(
    `${passed ? '✓' : '✗'} ${file}: ${hasImport ? 'imported' : 'missing import'}, ${hasUsage ? 'used' : 'not used'}`,
    passed ? 'green' : 'red'
  );
  if (passed) passCount++; else failCount++;
}

// 5. Error States with VEX Voice
log('\n5. VEX Voice Error Messages', 'blue');
const errorFiles = [
  ['src/session/components/states/SessionErrorState.tsx', 'Boss Interference'],
  ['src/shared/monetization/components/PurchaseErrorState.tsx', 'VEX lost connection'],
  ['src/components/states/ErrorState.tsx', 'Boss Interference Detected'],
];

for (const [file, phrase] of errorFiles) {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
  const hasPhrase = content.includes(phrase);
  log(
    `${hasPhrase ? '✓' : '✗'} ${file}: "${phrase}"`,
    hasPhrase ? 'green' : 'red'
  );
  if (hasPhrase) passCount++; else failCount++;
}

// 6. E2E Test Files
log('\n6. E2E Test Infrastructure', 'blue');
const e2eFiles = [
  ['e2e/flows/complete-session-flow.test.ts', 'Complete Session Flow'],
  ['e2e/flows/auth-flow.test.ts', 'Auth Flow'],
  ['e2e/flows/purchase-flow.test.ts', 'Purchase Flow'],
  ['e2e/utils/test-helpers.ts', 'Test Helpers'],
];

for (const [file, desc] of e2eFiles) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 7. Documentation
log('\n7. Documentation', 'blue');
const docs = [
  ['docs/QA_TESTING_GUIDE.md', 'QA Testing Guide'],
];

for (const [file, desc] of docs) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// ============================================
// SUMMARY
// ============================================

log('\n=== VERIFICATION SUMMARY ===\n', 'blue');
log(`Passed: ${passCount}`, 'green');
log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
log(`Total: ${passCount + failCount}`);

const percentage = Math.round((passCount / (passCount + failCount)) * 100);
log(`\nCompletion: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');

// Phase 24 Readiness
log('\n=== PHASE 24 READINESS ===\n', 'blue');

if (failCount === 0) {
  log('✓ All verification checks passed!', 'green');
  log('✓ Ready for manual QA testing', 'green');
  log('\nNext steps:', 'blue');
  log('1. Run app on real device');
  log('2. Follow QA_TESTING_GUIDE.md procedures');
  log('3. Document results in testing notes');
} else {
  log('✗ Some verification checks failed', 'red');
  log('\nRequired actions:', 'yellow');
  log('- Fix failed components before QA testing');
  log('- Re-run verification after fixes');
}

process.exit(failCount > 0 ? 1 : 0);
