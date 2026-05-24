/**
 * PHASE 9 EXIT GATE EXECUTION
 *
 * This script runs the complete Phase 9 Exit Gate verification
 * to ensure all production hardening systems are ready.
 */

import { Phase9ExitGate } from './Phase9ExitGate.js';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('phase9-exit-gate');

async function runPhase9ExitGate() {
  debug.info('Starting PHASE 9 EXIT GATE verification...');

  try {
    const exitGate = Phase9ExitGate.getInstance();
    const result = await exitGate.runExitGate();

    debug.info('PHASE 9 EXIT GATE RESULTS', {
      passed: result.passed,
      score: result.score,
      deploymentReady: result.deploymentReady,
      categories: Object.keys(result.results),
      blockingIssuesCount: result.blockingIssues.length,
      recommendationsCount: result.recommendations.length,
      timestamp: result.timestamp,
    });

    Object.entries(result.results).forEach(([category, categoryResult]) => {
      debug.info(`Category result: ${category}`, {
        status: categoryResult.status,
        score: categoryResult.score,
        issues: categoryResult.issues.length,
      });
    });

    if (result.blockingIssues.length > 0) {
      debug.warn('Blocking issues found', {
        count: result.blockingIssues.length,
        issues: result.blockingIssues.map((i) => ({ category: i.category, message: i.message })),
      });
    }

    if (result.passed && result.deploymentReady) {
      debug.info('PHASE 9 EXIT GATE PASSED - Ready for deployment');
    } else {
      debug.error('PHASE 9 EXIT GATE FAILED - Address blocking issues before deployment');
    }

    process.exit(result.passed && result.deploymentReady ? 0 : 1);
  } catch (error) {
    debug.error('PHASE 9 EXIT GATE EXECUTION FAILED', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

void runPhase9ExitGate();
