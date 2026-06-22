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

  const results = [];

  console.log(`${colors.bold}1. SESSION COMPLETE → ECONOMY CHAIN${colors.reset}`);
  results.push(checkSessionCompleteEconomyChain(check, fail));

  console.log(`\n${colors.bold}2. ONBOARDING → SESSION HANDOFF${colors.reset}`);
  results.push(checkOnboardingSessionHandoff(check, fail));

  console.log(`\n${colors.bold}3. CONTENT STUDY → SESSION LOOP${colors.reset}`);
  results.push(checkContentStudySessionLoop(check, fail));

  console.log(`\n${colors.bold}4. SQUAD SHARE → DEEP LINK${colors.reset}`);
  results.push(checkSquadShareDeepLink(check, fail));

  console.log(`\n${colors.bold}5. STREAK AT RISK → TAB BAR PULSE${colors.reset}`);
  results.push(checkStreakAtRiskTabBarPulse(check, fail));

  const allPass = results.every(Boolean);

  console.log(`\n${colors.bold}════════════════════════════════════════════════════════════════${colors.reset}`);

  if (allPass) {
    console.log(`${colors.bold}${colors.green}                    ALL INTEGRATION POINTS PASS                    ${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}                     SOME INTEGRATION POINTS FAIL                  ${colors.reset}`);
  }

  console.log(`${colors.bold}════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const labels = [
    'SESSION COMPLETE → ECONOMY CHAIN',
    'ONBOARDING → SESSION HANDOFF',
    'CONTENT STUDY → SESSION LOOP',
    'SQUAD SHARE → DEEP LINK',
    'STREAK AT RISK → TAB BAR PULSE',
  ];
  console.log(`${colors.cyan}Detailed Report:${colors.reset}\n`);
  results.forEach((r, i) => {
    console.log(`  ${r ? check : fail} ${i + 1}. ${labels[i]}`);
  });

  console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                        FINAL RESULT: ${allPass ? 'PASS ' : 'FAIL '}                      ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}`);

  process.exit(allPass ? 0 : 1);
}

audit();
