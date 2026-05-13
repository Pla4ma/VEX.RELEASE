const { Project } = require('ts-morph');
const fs = require('fs');

const project = new Project();
const sourceFile = project.addSourceFileAtPath('src_impl/session/SessionOrchestrator.ts');

const methodsToRemove = [
  'tapCompanion', 'activateBossAbility', 'completeRestChallenge', 'skipRestChallenge',
  'getFlowState', 'getFlowPulseQuality', 'getBossAbilityStates', 'isBossAttacking',
  'getPurityAccelerationBonus', 'getNextPhaseQualityMultiplier', 'setBossActive',
  'endBreak', 'updateFocusQuality', 'logInterruption', 'logRecovery', 'addDocument',
  'removeDocument', 'getSessionHistory', 'getSessionStats'
];

const classDecl = sourceFile.getClass('SessionOrchestrator');
if (classDecl) {
  for (const m of methodsToRemove) {
    const method = classDecl.getMethod(m);
    if (method) {
      method.remove();
    }
  }
}

sourceFile.saveSync();
console.log('SessionOrchestrator sliced.');
