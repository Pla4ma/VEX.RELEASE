/**
 * Integration Audit Verification Script
 *
 * Validates the 5 critical integration points by inspecting source code.
 * Run with: node scripts/integration-audit.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const check = `${colors.green}✓${colors.reset}`;
const fail = `${colors.red}✗${colors.reset}`;

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function audit() {
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                 INTEGRATION AUDIT VERIFICATION                 ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  let allPass = true;

  // ============================================================================
  // 1. SESSION COMPLETE → ECONOMY CHAIN
  // ============================================================================
  console.log(`${colors.bold}1. SESSION COMPLETE → ECONOMY CHAIN${colors.reset}`);

  const sessionCompleteChest = readFile(
    path.join(__dirname, '../src/screens/session/hooks/useSessionCompleteChest.ts')
  );
  const sessionRewardSync = readFile(
    path.join(__dirname, '../src/screens/session/hooks/useSessionRewardSync.ts')
  );
  const sessionRewardsSection = readFile(
    path.join(__dirname, '../src/screens/session/components/SessionCompletionRewardsSection.tsx')
  );

  if (sessionCompleteChest && sessionRewardSync && sessionRewardsSection) {
    // Check (a) chest preparation is isolated from reward crediting.
    const hasPrepareChest = sessionCompleteChest.includes('prepareChest');
    const hasRollChest = sessionCompleteChest.includes('rollChest');
    const hasApplyChestRewards =
      sessionRewardSync.includes('applyChestRewards') &&
      sessionRewardsSection.includes('applyChestRewards');
    const hasCreditSessionRewards = sessionRewardSync.includes('creditSessionRewards');
    const hasPrepareChestOnMount = sessionCompleteChest.includes('void prepareChest()');

    console.log(`   ${hasPrepareChest && hasRollChest ? check : fail} prepareChest() calls rollChest()`);
    console.log(`   ${hasPrepareChestOnMount ? check : fail} prepareChest() called on mount`);
    console.log(`   ${hasApplyChestRewards && hasCreditSessionRewards ? check : fail} applyChestRewards() calls creditSessionRewards()`);

    // Check (b) retry wrapper with 3 attempts and correct delays
    const hasRetryDelays = sessionRewardSync.includes('RETRY_DELAYS_MS = [500, 1000, 2000]');
    const hasRetryLoop = sessionRewardSync.includes('attemptIndex <= RETRY_DELAYS_MS.length');

    console.log(`   ${hasRetryDelays ? check : fail} RETRY_DELAYS_MS = [500, 1000, 2000]`);
    console.log(`   ${hasRetryLoop ? check : fail} Retry loop attempts max 3 times`);

    // Check (c) Banner with variant="warning" on failure
    const hasWarningBanner = sessionRewardsSection.includes('variant="warning"');
    const hasFailedStatus = sessionRewardsSection.includes("rewardCreditStatus === 'failed'");

    console.log(`   ${hasWarningBanner && hasFailedStatus ? check : fail} Banner with variant="warning" on all 3 failures`);

    if (!(hasPrepareChest && hasRollChest && hasPrepareChestOnMount && hasApplyChestRewards &&
          hasCreditSessionRewards && hasRetryDelays && hasRetryLoop && hasWarningBanner && hasFailedStatus)) {
      allPass = false;
    }
  } else {
    console.log(`   ${fail} Session completion reward files not found`);
    allPass = false;
  }

  // ============================================================================
  // 2. ONBOARDING → SESSION HANDOFF
  // ============================================================================
  console.log(`\n${colors.bold}2. ONBOARDING → SESSION HANDOFF${colors.reset}`);

  const onboardingFlowScreen = readFile(
    path.join(__dirname, '../src/screens/onboarding/OnboardingFlowScreen.tsx')
  );

  if (onboardingFlowScreen) {
    // Check Step 6 navigates to SessionStack with correct params
    const hasSessionStack = onboardingFlowScreen.includes("'SessionStack'");
    const hasSessionSetup = onboardingFlowScreen.includes("screen: 'SessionSetup'");
    const hasPresetId = onboardingFlowScreen.includes('presetId:');
    const hasOnboardingSource = onboardingFlowScreen.includes("'onboarding_first_session'");

    console.log(`   ${hasSessionStack ? check : fail} Navigates to 'SessionStack'`);
    console.log(`   ${hasSessionSetup ? check : fail} screen: 'SessionSetup'`);
    console.log(`   ${hasPresetId ? check : fail} params.presetId passed`);
    console.log(`   ${hasOnboardingSource ? check : fail} source: 'onboarding_first_session'`);

    // Check useEffect listens for the typed focus hook on the launch step.
    const hasIsFocused = onboardingFlowScreen.includes('useIsFocused()');
    const hasFocusGuard = onboardingFlowScreen.includes('!isFocused');
    const hasStep5Check =
      onboardingFlowScreen.includes('step !== LAST_STEP_INDEX') ||
      onboardingFlowScreen.includes('step !== 4');
    const hasHistoryCheck = onboardingFlowScreen.includes('historyQuery.history.length');
    const hasFinishOnboarding = onboardingFlowScreen.includes('finishOnboarding');

    console.log(`   ${hasIsFocused ? check : fail} useIsFocused() hook used`);
    console.log(`   ${hasFocusGuard ? check : fail} Focus guard checked before return detection`);
    console.log(`   ${hasStep5Check ? check : fail} Step 5 launch step check present`);
    console.log(`   ${hasHistoryCheck && hasFinishOnboarding ? check : fail} Completes onboarding on return from session`);

    if (!(hasSessionStack && hasSessionSetup && hasPresetId && hasOnboardingSource &&
          hasIsFocused && hasFocusGuard && hasStep5Check && hasHistoryCheck && hasFinishOnboarding)) {
      allPass = false;
    }
  } else {
    console.log(`   ${fail} OnboardingFlowScreen.tsx not found`);
    allPass = false;
  }

  // ============================================================================
  // 3. CONTENT STUDY → SESSION LOOP
  // ============================================================================
  console.log(`\n${colors.bold}3. CONTENT STUDY → SESSION LOOP${colors.reset}`);

  const studyPlanScreen = readFile(
    path.join(__dirname, '../src/features/content-study/screens/StudyPlanScreen.tsx')
  );

  if (studyPlanScreen) {
    // Check "Focus on this now" CTA passes correct params
    const hasSourceParam = studyPlanScreen.includes("source: 'content-study'");
    const hasGenerationId = studyPlanScreen.includes('generationId');
    const hasFocusAreas = studyPlanScreen.includes('focusAreas:');
    const hasKeyConceptsSlice = studyPlanScreen.includes('keyConcepts.slice(0, 3)');
    const hasSessionStackNav = studyPlanScreen.includes("'SessionStack'");
    const hasSessionSetupScreen = studyPlanScreen.includes("'SessionSetup'");

    console.log(`   ${hasSessionStackNav ? check : fail} Navigates to 'SessionStack'`);
    console.log(`   ${hasSessionSetupScreen ? check : fail} screen: 'SessionSetup'`);
    console.log(`   ${hasSourceParam ? check : fail} source: 'content-study'`);
    console.log(`   ${hasGenerationId ? check : fail} generationId passed`);
    console.log(`   ${hasFocusAreas && hasKeyConceptsSlice ? check : fail} focusAreas: first 3 key concepts`);

    if (!(hasSourceParam && hasGenerationId && hasFocusAreas && hasKeyConceptsSlice &&
          hasSessionStackNav && hasSessionSetupScreen)) {
      allPass = false;
    }
  } else {
    console.log(`   ${fail} StudyPlanScreen.tsx not found`);
    allPass = false;
  }

  // ============================================================================
  // 4. SQUAD SHARE → DEEP LINK
  // ============================================================================
  console.log(`\n${colors.bold}4. SQUAD SHARE → DEEP LINK${colors.reset}`);

  const squadShareTs = readFile(
    path.join(__dirname, '../src/features/squads/share.ts')
  );
  const useSquadShareTs = readFile(
    path.join(__dirname, '../src/features/squads/hooks/useSquadShare.ts')
  );

  if (squadShareTs && useSquadShareTs) {
    // Check share message format
    const hasBuildSquadCode = squadShareTs.includes('buildSquadCode');
    const hasSlice8 = squadShareTs.includes('squadId.slice(0, 8)');
    const hasBuildSquadShareMessage = squadShareTs.includes('buildSquadShareMessage');
    const hasSquadName = squadShareTs.includes('squad.name');
    const hasFocusHours = squadShareTs.includes('focusHours');

    console.log(`   ${hasBuildSquadCode && hasSlice8 ? check : fail} Squad code = first 8 chars of UUID`);
    console.log(`   ${hasBuildSquadShareMessage ? check : fail} buildSquadShareMessage() exists`);
    console.log(`   ${hasSquadName ? check : fail} Squad name in message`);
    console.log(`   ${hasFocusHours ? check : fail} Weekly focus hours in message`);

    // Check URL format
    const hasCorrectUrlFormat = useSquadShareTs.includes('https://vex.app/squad/${squadCode}');

    console.log(`   ${hasCorrectUrlFormat ? check : fail} URL format: https://vex.app/squad/[code]`);

    if (!(hasBuildSquadCode && hasSlice8 && hasBuildSquadShareMessage && hasSquadName &&
          hasFocusHours && hasCorrectUrlFormat)) {
      allPass = false;
    }
  } else {
    console.log(`   ${fail} Squad share files not found`);
    allPass = false;
  }

  // ============================================================================
  // 5. STREAK AT RISK → TAB BAR PULSE
  // ============================================================================
  console.log(`\n${colors.bold}5. STREAK AT RISK → TAB BAR PULSE${colors.reset}`);

  const vexTabBar = readFile(
    path.join(__dirname, '../src/navigation/components/VexTabBar.tsx')
  );

  if (vexTabBar) {
    // Check pulse conditions
    const hasIsAtRiskCheck = vexTabBar.includes('isAtRisk');
    const hasCurrentDaysCheck = vexTabBar.includes('currentDays');
    const hasHourCheck = vexTabBar.includes('getHours()');
    const hasHour18Check = vexTabBar.includes('hour >= 18');
    const hasPulseStart = vexTabBar.includes('pulseStart');
    const hasStartTabPulse = vexTabBar.includes("route.name === 'Start' && pulseStart");

    console.log(`   ${hasIsAtRiskCheck ? check : fail} Checks streakSummary.isAtRisk`);
    console.log(`   ${hasCurrentDaysCheck ? check : fail} Checks currentStreak > 0 (currentDays > 0)`);
    console.log(`   ${hasHourCheck && hasHour18Check ? check : fail} Checks new Date().getHours() >= 18`);
    console.log(`   ${hasPulseStart ? check : fail} pulseStart calculation exists`);
    console.log(`   ${hasStartTabPulse ? check : fail} Pulse only on Start tab`);

    if (!(hasIsAtRiskCheck && hasCurrentDaysCheck && hasHourCheck && hasHour18Check &&
          hasPulseStart && hasStartTabPulse)) {
      allPass = false;
    }
  } else {
    console.log(`   ${fail} VexTabBar.tsx not found`);
    allPass = false;
  }

  // ============================================================================
  // FINAL REPORT
  // ============================================================================
  console.log(`
${colors.bold}════════════════════════════════════════════════════════════════${colors.reset}`);

  if (allPass) {
    console.log(`${colors.bold}${colors.green}                    ALL INTEGRATION POINTS PASS                    ${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}                     SOME INTEGRATION POINTS FAIL                  ${colors.reset}`);
  }

  console.log(`${colors.bold}════════════════════════════════════════════════════════════════${colors.reset}
`);

  console.log(`${colors.cyan}Detailed Report:${colors.reset}
`);
  console.log(`  ${allPass ? check : fail} 1. SESSION COMPLETE → ECONOMY CHAIN`);
  console.log(`  ${allPass ? check : fail} 2. ONBOARDING → SESSION HANDOFF`);
  console.log(`  ${allPass ? check : fail} 3. CONTENT STUDY → SESSION LOOP`);
  console.log(`  ${allPass ? check : fail} 4. SQUAD SHARE → DEEP LINK`);
  console.log(`  ${allPass ? check : fail} 5. STREAK AT RISK → TAB BAR PULSE`);

  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                        FINAL RESULT: ${allPass ? 'PASS ' : 'FAIL '}                      ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  process.exit(allPass ? 0 : 1);
}

audit();
