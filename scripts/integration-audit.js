/**
 * Integration Audit Verification Script
 *
 * Validates the 5 critical integration points by inspecting source code.
 * Run with: node scripts/integration-audit.js
 */

const {
  checkSessionCompleteEconomyChain,
  checkOnboardingSessionHandoff,
  checkContentStudySessionLoop,
  checkSquadShareDeepLink,
  checkStreakAtRiskTabBarPulse,
} = require('./integration-audit-checks');

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

function audit() {
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                 INTEGRATION AUDIT VERIFICATION                 ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  let allPass = true;

  // 1. SESSION COMPLETE → ECONOMY CHAIN
  console.log(`${colors.bold}1. SESSION COMPLETE → ECONOMY CHAIN${colors.reset}`);
  if (!checkSessionCompleteEconomyChain(check, fail)) allPass = false;

  // 2. ONBOARDING → SESSION HANDOFF
  console.log(`\n${colors.bold}2. ONBOARDING → SESSION HANDOFF${colors.reset}`);
  if (!checkOnboardingSessionHandoff(check, fail)) allPass = false;

  // 3. CONTENT STUDY → SESSION LOOP
  console.log(`\n${colors.bold}3. CONTENT STUDY → SESSION LOOP${colors.reset}`);
  if (!checkContentStudySessionLoop(check, fail)) allPass = false;

  // 4. SQUAD SHARE → DEEP LINK
  console.log(`\n${colors.bold}4. SQUAD SHARE → DEEP LINK${colors.reset}`);
  if (!checkSquadShareDeepLink(check, fail)) allPass = false;

  // 5. STREAK AT RISK → TAB BAR PULSE
  console.log(`\n${colors.bold}5. STREAK AT RISK → TAB BAR PULSE${colors.reset}`);
  if (!checkStreakAtRiskTabBarPulse(check, fail)) allPass = false;

  // FINAL REPORT
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
