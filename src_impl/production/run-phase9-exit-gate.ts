/**
 * PHASE 9 EXIT GATE EXECUTION
 * 
 * This script runs the complete Phase 9 Exit Gate verification
 * to ensure all production hardening systems are ready.
 */

import { Phase9ExitGate } from './Phase9ExitGate.js';

async function runPhase9ExitGate() {
  console.log('🚀 Starting PHASE 9 EXIT GATE verification...\n');

  try {
    // Initialize the exit gate
    const exitGate = Phase9ExitGate.getInstance();
    
    // Run complete verification
    const result = await exitGate.runExitGate();
    
    console.log('='.repeat(60));
    console.log('📊 PHASE 9 EXIT GATE RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 OVERALL STATUS: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📈 OVERALL SCORE: ${result.score}/100`);
    console.log(`🚀 DEPLOYMENT READY: ${result.deploymentReady ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(40));
    
    Object.entries(result.results).forEach(([category, categoryResult]) => {
      const status = categoryResult.status === 'pass' ? '✅' : 
                    categoryResult.status === 'warning' ? '⚠️' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${categoryResult.status.toUpperCase()} (Score: ${categoryResult.score})`);
      
      if (categoryResult.issues.length > 0) {
        console.log(`   Issues: ${categoryResult.issues.length}`);
        categoryResult.issues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue}`);
        });
        if (categoryResult.issues.length > 3) {
          console.log(`   ... and ${categoryResult.issues.length - 3} more`);
        }
      }
    });
    
    if (result.blockingIssues.length > 0) {
      console.log('\n🚨 BLOCKING ISSUES:');
      console.log('-'.repeat(40));
      result.blockingIssues.forEach(issue => {
        console.log(`❌ ${issue.category.toUpperCase()}: ${issue.message}`);
        console.log(`   Impact: ${issue.impact}`);
        console.log(`   Fix Time: ${issue.estimatedFixTime}`);
        console.log(`   Recommendation: ${issue.recommendation}\n`);
      });
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('-'.repeat(40));
      result.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (result.passed && result.deploymentReady) {
      console.log('🎉 PHASE 9 EXIT GATE PASSED!');
      console.log('🚀 READY FOR PRODUCTION DEPLOYMENT!');
      console.log('✅ All production hardening systems verified and operational');
    } else {
      console.log('❌ PHASE 9 EXIT GATE FAILED!');
      console.log('🔧 Address blocking issues before deployment');
    }
    
    console.log('='.repeat(60));
    console.log(`📅 Verification completed at: ${new Date(result.timestamp).toISOString()}`);
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(result.passed && result.deploymentReady ? 0 : 1);
    
  } catch (error) {
    console.error('❌ PHASE 9 EXIT GATE EXECUTION FAILED:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

// Run the exit gate
runPhase9ExitGate();