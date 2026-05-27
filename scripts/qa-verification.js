/**
 * QA Verification Script
 * Automated checks for Phase 24 regression testing
 * 
 * Run: node scripts/qa-verification.js
 */

const fs = require('fs');
const path = require('path');
const {
  log,
  checkFileExists,
  criticalFiles,
  phase23Files,
  vexVoiceChecks,
  animatedCounterFiles,
  errorFiles,
  e2eFiles,
  docs,
} = require('./qa-verification-rules');

const SRC_DIR = path.join(__dirname, '..', 'src');

// ============================================
// VERIFICATION CHECKS
// ============================================

log('\n=== VEX APP - QA VERIFICATION ===\n', 'blue');

let passCount = 0;
let failCount = 0;

// 1. Critical Journey Files
log('1. Critical Journey Files', 'blue');
for (const [file, desc] of criticalFiles) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 2. Phase 23 Components
log('\n2. Phase 23 Polish Components', 'blue');
for (const [file, desc] of phase23Files) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 3. Empty States with VEX Voice
log('\n3. VEX Voice Empty States', 'blue');
const emptyStateContent = fs.readFileSync(
  path.join(__dirname, '..', 'src/shared/ui/primitives/EmptyState.tsx'),
  'utf-8'
);

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
for (const [file, desc] of e2eFiles) {
  if (checkFileExists(file, desc)) passCount++; else failCount++;
}

// 7. Documentation
log('\n7. Documentation', 'blue');
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
