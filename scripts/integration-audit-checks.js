/**
 * Integration Audit Checks
 *
 * Individual integration point verification functions.
 * Extracted from integration-audit.js for file size compliance.
 */

const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) { return null; }
}

function checkSessionCompleteEconomyChain(check, fail) {
  let pass = true;
  const chest = readFile(path.join(__dirname, '../archive/economy-chest/hooks/useSessionCompleteChest.ts'));
  const sync = readFile(path.join(__dirname, '../src/screens/session/hooks/useSessionRewardSync.ts'));
  const section = readFile(path.join(__dirname, '../src/screens/session/components/SessionCompletionRewardsSection.tsx'));

  if (chest && sync && section) {
    const hasPrepare = chest.includes('prepareChest');
    const hasRoll = chest.includes('rollChest');
    const hasApply = sync.includes('applyChestRewards') && section.includes('applyChestRewards');
    const hasCredit = sync.includes('creditSessionRewards');
    const hasOnMount = chest.includes('void prepareChest()');
    console.log(`   ${hasPrepare && hasRoll ? check : fail} prepareChest() calls rollChest()`);
    console.log(`   ${hasOnMount ? check : fail} prepareChest() called on mount`);
    console.log(`   ${hasApply && hasCredit ? check : fail} applyChestRewards() calls creditSessionRewards()`);
    const hasRetryDelays = sync.includes('RETRY_DELAYS_MS = [500, 1000, 2000]');
    const hasRetryLoop = sync.includes('attemptIndex <= RETRY_DELAYS_MS.length');
    console.log(`   ${hasRetryDelays ? check : fail} RETRY_DELAYS_MS = [500, 1000, 2000]`);
    console.log(`   ${hasRetryLoop ? check : fail} Retry loop attempts max 3 times`);
    const hasBanner = section.includes('variant="warning"');
    const hasFailed = section.includes("rewardCreditStatus === 'failed'");
    console.log(`   ${hasBanner && hasFailed ? check : fail} Banner with variant="warning" on all 3 failures`);
    if (!(hasPrepare && hasRoll && hasOnMount && hasApply && hasCredit && hasRetryDelays && hasRetryLoop && hasBanner && hasFailed)) pass = false;
  } else {
    console.log(`   ${fail} Session completion reward files not found`);
    pass = false;
  }
  return pass;
}

function checkOnboardingSessionHandoff(check, fail) {
  let pass = true;
  const screen = readFile(path.join(__dirname, '../src/screens/onboarding/OnboardingFlowScreen.tsx'));
  if (screen) {
    const hasStack = screen.includes("'SessionStack'");
    const hasSetup = screen.includes("screen: 'SessionSetup'");
    const hasPreset = screen.includes('presetId:');
    const hasSource = screen.includes("'onboarding_first_session'");
    console.log(`   ${hasStack ? check : fail} Navigates to 'SessionStack'`);
    console.log(`   ${hasSetup ? check : fail} screen: 'SessionSetup'`);
    console.log(`   ${hasPreset ? check : fail} params.presetId passed`);
    console.log(`   ${hasSource ? check : fail} source: 'onboarding_first_session'`);
    const hasFocused = screen.includes('useIsFocused()');
    const hasGuard = screen.includes('!isFocused');
    const hasStep5 = screen.includes('step !== LAST_STEP_INDEX') || screen.includes('step !== 4');
    const hasHistory = screen.includes('historyQuery.history.length');
    const hasFinish = screen.includes('finishOnboarding');
    console.log(`   ${hasFocused ? check : fail} useIsFocused() hook used`);
    console.log(`   ${hasGuard ? check : fail} Focus guard checked before return detection`);
    console.log(`   ${hasStep5 ? check : fail} Step 5 launch step check present`);
    console.log(`   ${hasHistory && hasFinish ? check : fail} Completes onboarding on return from session`);
    if (!(hasStack && hasSetup && hasPreset && hasSource && hasFocused && hasGuard && hasStep5 && hasHistory && hasFinish)) pass = false;
  } else {
    console.log(`   ${fail} OnboardingFlowScreen.tsx not found`);
    pass = false;
  }
  return pass;
}

function checkContentStudySessionLoop(check, fail) {
  let pass = true;
  const screen = readFile(path.join(__dirname, '../src/features/content-study/screens/StudyPlanScreen.tsx'));
  if (screen) {
    const hasSrc = screen.includes("source: 'content-study'");
    const hasGen = screen.includes('generationId');
    const hasFocus = screen.includes('focusAreas:');
    const hasSlice = screen.includes('keyConcepts.slice(0, 3)');
    const hasNav = screen.includes("'SessionStack'");
    const hasSetup = screen.includes("'SessionSetup'");
    console.log(`   ${hasNav ? check : fail} Navigates to 'SessionStack'`);
    console.log(`   ${hasSetup ? check : fail} screen: 'SessionSetup'`);
    console.log(`   ${hasSrc ? check : fail} source: 'content-study'`);
    console.log(`   ${hasGen ? check : fail} generationId passed`);
    console.log(`   ${hasFocus && hasSlice ? check : fail} focusAreas: first 3 key concepts`);
    if (!(hasSrc && hasGen && hasFocus && hasSlice && hasNav && hasSetup)) pass = false;
  } else {
    console.log(`   ${fail} StudyPlanScreen.tsx not found`);
    pass = false;
  }
  return pass;
}

function checkSquadShareDeepLink(check, fail) {
  let pass = true;
  const share = readFile(path.join(__dirname, '../src/features/squads/share.ts'));
  const hook = readFile(path.join(__dirname, '../src/features/squads/hooks/useSquadShare.ts'));
  if (share && hook) {
    const hasCode = share.includes('buildSquadCode');
    const hasSlice = share.includes('squadId.slice(0, 8)');
    const hasMsg = share.includes('buildSquadShareMessage');
    const hasName = share.includes('squad.name');
    const hasHours = share.includes('focusHours');
    console.log(`   ${hasCode && hasSlice ? check : fail} Squad code = first 8 chars of UUID`);
    console.log(`   ${hasMsg ? check : fail} buildSquadShareMessage() exists`);
    console.log(`   ${hasName ? check : fail} Squad name in message`);
    console.log(`   ${hasHours ? check : fail} Weekly focus hours in message`);
    const hasUrl = hook.includes('https://vex.app/squad/${squadCode}');
    console.log(`   ${hasUrl ? check : fail} URL format: https://vex.app/squad/[code]`);
    if (!(hasCode && hasSlice && hasMsg && hasName && hasHours && hasUrl)) pass = false;
  } else {
    console.log(`   ${fail} Squad share files not found`);
    pass = false;
  }
  return pass;
}

function checkStreakAtRiskTabBarPulse(check, fail) {
  let pass = true;
  const bar = readFile(path.join(__dirname, '../src/navigation/components/VexTabBar.tsx'));
  if (bar) {
    const hasRisk = bar.includes('isAtRisk');
    const hasDays = bar.includes('currentDays');
    const hasHour = bar.includes('getHours()');
    const has18 = bar.includes('hour >= 18');
    const hasPulse = bar.includes('pulseStart');
    const hasTab = bar.includes("route.name === 'Start' && pulseStart");
    console.log(`   ${hasRisk ? check : fail} Checks streakSummary.isAtRisk`);
    console.log(`   ${hasDays ? check : fail} Checks currentStreak > 0 (currentDays > 0)`);
    console.log(`   ${hasHour && has18 ? check : fail} Checks new Date().getHours() >= 18`);
    console.log(`   ${hasPulse ? check : fail} pulseStart calculation exists`);
    console.log(`   ${hasTab ? check : fail} Pulse only on Start tab`);
    if (!(hasRisk && hasDays && hasHour && has18 && hasPulse && hasTab)) pass = false;
  } else {
    console.log(`   ${fail} VexTabBar.tsx not found`);
    pass = false;
  }
  return pass;
}

module.exports = {
  readFile,
  checkSessionCompleteEconomyChain,
  checkOnboardingSessionHandoff,
  checkContentStudySessionLoop,
  checkSquadShareDeepLink,
  checkStreakAtRiskTabBarPulse,
};
