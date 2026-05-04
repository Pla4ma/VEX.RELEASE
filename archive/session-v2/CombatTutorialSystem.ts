/**
 * Combat Tutorial System
 * 
 * Guides first-time users through combat mechanics with step-by-step tutorials.
 * Includes ability introduction, dodge training, combo practice, and boss phase tutorials.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, CombatTutorial, TutorialStep, CombatAbility, BossAttackPattern } from './types';

const debug = createDebugger('session:v2:combat-tutorial');

// ============================================================================
// Tutorial System
// ============================================================================

export interface TutorialProgress {
  tutorialId: string;
  currentStepIndex: number;
  isCompleted: boolean;
  startTime: number;
  stepStartTime: number;
  stepProgress: Record<string, number>;
}

export class CombatTutorialSystem {
  private session: SessionV2State | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Tutorial state
  private currentTutorial: CombatTutorial | null = null;
  private currentStep: TutorialStep | null = null;
  private progress: TutorialProgress | null = null;
  
  // Tutorial definitions
  private tutorials: Map<string, CombatTutorial> = new Map();
  
  constructor() {
    this.initializeTutorials();
    debug.info('CombatTutorialSystem initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  initialize(session: SessionV2State): void {
    this.session = session;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('CombatTutorialSystem initialized for session: %s', session.id);
  }
  
  start(): void {
    if (!this.session || this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Check if user needs tutorial (would check user profile)
    const needsTutorial = this.checkIfUserNeedsTutorial();
    
    if (needsTutorial) {
      this.startTutorial('COMBAT_BASICS');
    }
    
    debug.info('CombatTutorialSystem started');
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    debug.info('CombatTutorialSystem paused');
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    debug.info('CombatTutorialSystem resumed');
  }
  
  cleanup(): void {
    this.session = null;
    this.isRunning = false;
    this.isPaused = false;
    this.currentTutorial = null;
    this.currentStep = null;
    this.progress = null;
    
    debug.info('CombatTutorialSystem cleaned up');
  }
  
  // ============================================================================
  // Tutorial Management
  // ============================================================================
  
  private checkIfUserNeedsTutorial(): boolean {
    // Would check user profile for tutorial completion
    // For now, assume new users need tutorial
    return true;
  }
  
  startTutorial(tutorialId: string): boolean {
    if (!this.session || !this.isRunning || this.isPaused) {
      return false;
    }
    
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      debug.error('Tutorial not found: %s', tutorialId);
      return false;
    }
    
    // Check prerequisites
    if (!this.checkTutorialPrerequisites(tutorial)) {
      debug.error('Tutorial prerequisites not met: %s', tutorialId);
      return false;
    }
    
    this.currentTutorial = tutorial;
    this.progress = {
      tutorialId,
      currentStepIndex: 0,
      isCompleted: false,
      startTime: Date.now(),
      stepStartTime: Date.now(),
      stepProgress: {},
    };
    
    this.currentStep = tutorial.steps[0];
    
    // Emit tutorial started event
    eventBus.publish('tutorial:started', {
      sessionId: this.session.id,
      userId: this.session.userId,
      tutorialId,
      stepId: this.currentStep.id,
    });
    
    // Start first step
    this.startCurrentStep();
    
    debug.info('Tutorial started: %s', tutorialId);
    return true;
  }
  
  private checkTutorialPrerequisites(tutorial: CombatTutorial): boolean {
    // Check level requirement
    if (tutorial.requiredLevel) {
      const userLevel = 1; // Would get from progression system
      if (userLevel < tutorial.requiredLevel) {
        return false;
      }
    }
    
    // Check ability requirements
    if (tutorial.requiredAbilities) {
      const userAbilities = this.session?.activeAbilities.map(a => a.id) || [];
      for (const requiredAbility of tutorial.requiredAbilities) {
        if (!userAbilities.includes(requiredAbility)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  private startCurrentStep(): void {
    if (!this.currentStep || !this.progress) {
      return;
    }
    
    this.progress.stepStartTime = Date.now();
    
    // Emit step started event
    eventBus.publish('tutorial:step_started', {
      sessionId: this.session!.id,
      userId: this.session!.userId,
      tutorialId: this.progress.tutorialId,
      stepId: this.currentStep.id,
    });
    
    debug.info('Tutorial step started: %s', this.currentStep.id);
  }
  
  completeCurrentStep(): boolean {
    if (!this.currentStep || !this.progress || !this.currentTutorial) {
      return false;
    }
    
    const stepTime = Date.now() - this.progress.stepStartTime;
    
    // Mark step as completed
    this.currentStep.isCompleted = true;
    
    // Emit step completed event
    eventBus.publish('tutorial:step_completed', {
      sessionId: this.session!.id,
      userId: this.session!.userId,
      tutorialId: this.progress.tutorialId,
      stepId: this.currentStep.id,
      timeSpent: stepTime,
    });
    
    // Move to next step
    this.progress.currentStepIndex++;
    
    if (this.progress.currentStepIndex >= this.currentTutorial.steps.length) {
      // Tutorial completed
      this.completeTutorial();
    } else {
      // Start next step
      this.currentStep = this.currentTutorial.steps[this.progress.currentStepIndex];
      this.startCurrentStep();
    }
    
    debug.info('Tutorial step completed: %s', this.currentStep.id);
    return true;
  }
  
  private completeTutorial(): void {
    if (!this.currentTutorial || !this.progress) {
      return;
    }
    
    const totalTime = Date.now() - this.progress.startTime;
    this.progress.isCompleted = true;
    
    // Emit tutorial completed event
    eventBus.publish('tutorial:completed', {
      sessionId: this.session!.id,
      userId: this.session!.userId,
      tutorialId: this.progress.tutorialId,
      totalTime,
      rewardsEarned: this.currentTutorial.completionReward,
    });
    
    // Grant rewards (would integrate with progression/economy systems)
    this.grantTutorialRewards(this.currentTutorial.completionReward);
    
    debug.info('Tutorial completed: %s', this.progress.tutorialId);
    
    // Reset current tutorial
    this.currentTutorial = null;
    this.currentStep = null;
    this.progress = null;
  }
  
  private grantTutorialRewards(rewards: { xp: number; coins: number; unlockAbility?: string }): void {
    // Would integrate with progression and economy systems
    debug.info('Tutorial rewards granted: %o', rewards);
  }
  
  // ============================================================================
  // Tutorial Step Handling
  // ============================================================================
  
  handleAbilityUsed(abilityId: string): void {
    if (!this.currentStep || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Check if this step requires ability usage
    const abilityCondition = this.currentStep.completionConditions.find(
      condition => condition.type === 'ABILITY_USED'
    );
    
    if (abilityCondition && this.currentStep.config.abilityId === abilityId) {
      this.updateStepProgress('ABILITY_USED', 1);
      
      if (this.shouldCompleteStep(abilityCondition)) {
        this.completeCurrentStep();
      }
    }
  }
  
  handleDodgeAttempt(success: boolean): void {
    if (!this.currentStep || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Check if this step requires dodge
    const dodgeCondition = this.currentStep.completionConditions.find(
      condition => condition.type === 'DODGE_SUCCESS'
    );
    
    if (dodgeCondition && success) {
      this.updateStepProgress('DODGE_SUCCESS', 1);
      
      if (this.shouldCompleteStep(dodgeCondition)) {
        this.completeCurrentStep();
      }
    }
  }
  
  handleComboTriggered(comboCount: number): void {
    if (!this.currentStep || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Check if this step requires combo
    const comboCondition = this.currentStep.completionConditions.find(
      condition => condition.type === 'COMBO_ACHIEVED'
    );
    
    if (comboCondition) {
      this.updateStepProgress('COMBO_ACHIEVED', comboCount);
      
      if (this.shouldCompleteStep(comboCondition)) {
        this.completeCurrentStep();
      }
    }
  }
  
  handleTimeElapsed(): void {
    if (!this.currentStep || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Check if this step requires time
    const timeCondition = this.currentStep.completionConditions.find(
      condition => condition.type === 'TIME_ELAPSED'
    );
    
    if (timeCondition) {
      const elapsed = Date.now() - this.progress!.stepStartTime;
      this.updateStepProgress('TIME_ELAPSED', elapsed);
      
      if (this.shouldCompleteStep(timeCondition)) {
        this.completeCurrentStep();
      }
    }
  }
  
  private updateStepProgress(type: string, value: number): void {
    if (!this.progress) {
      return;
    }
    
    this.progress.stepProgress[type] = value;
  }
  
  private shouldCompleteStep(condition: any): boolean {
    if (!this.progress) {
      return false;
    }
    
    const current = this.progress.stepProgress[condition.type] || 0;
    
    switch (condition.operator) {
      case '=':
        return current === condition.value;
      case '>':
        return current > condition.value;
      case '<':
        return current < condition.value;
      case '>=':
        return current >= condition.value;
      case '<=':
        return current <= condition.value;
      default:
        return false;
    }
  }
  
  // ============================================================================
  // Tutorial Definitions
  // ============================================================================
  
  private initializeTutorials(): void {
    // Combat Basics Tutorial
    const combatBasics: CombatTutorial = {
      id: 'COMBAT_BASICS',
      name: 'Combat Basics',
      description: 'Learn the fundamentals of combat during focus sessions',
      steps: [
        {
          id: 'WELCOME',
          title: 'Welcome to Combat!',
          instruction: 'During focus sessions, you\'ll battle bosses that represent distractions. Let\'s learn how to fight back!',
          type: 'ABILITY_INTRO',
          config: {
            abilityId: 'FOCUS_STRIKE',
          },
          completionConditions: [
            { type: 'TIME_ELAPSED', value: 5000, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['boss-health', 'energy-bar'],
          overlayText: 'This is your boss! Watch its health bar.',
        },
        {
          id: 'ABILITY_INTRO',
          title: 'Your First Ability',
          instruction: 'Use Focus Strike to damage the boss. Tap the ability button when ready!',
          type: 'ABILITY_INTRO',
          config: {
            abilityId: 'FOCUS_STRIKE',
          },
          completionConditions: [
            { type: 'ABILITY_USED', value: 1, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['ability-FOCUS_STRIKE'],
          overlayText: 'Tap here to use Focus Strike!',
        },
        {
          id: 'DODGE_TRAINING',
          title: 'Dodging Attacks',
          instruction: 'Bosses will attack you! When you see an attack warning, tap DODGE to avoid damage.',
          type: 'DODGE_TRAINING',
          config: {
            attackPattern: 'DISTRACTION_WAVE',
          },
          completionConditions: [
            { type: 'DODGE_SUCCESS', value: 1, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['dodge-button'],
          overlayText: 'Tap DODGE when the boss attacks!',
        },
        {
          id: 'COMBO_PRACTICE',
          title: 'Building Combos',
          instruction: 'Use abilities quickly in succession to build combos and deal more damage!',
          type: 'COMBO_PRACTICE',
          config: {
            targetCombo: 3,
          },
          completionConditions: [
            { type: 'COMBO_ACHIEVED', value: 3, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['combo-counter'],
          overlayText: 'Build a 3x combo for bonus damage!',
        },
      ],
      currentStep: 0,
      isCompleted: false,
      requiredLevel: 1,
      completionReward: {
        xp: 100,
        coins: 50,
        unlockAbility: 'DEEP_WORK_PUNCH',
      },
    };
    
    // Advanced Combat Tutorial
    const advancedCombat: CombatTutorial = {
      id: 'ADVANCED_COMBAT',
      name: 'Advanced Combat',
      description: 'Master advanced combat techniques and strategies',
      steps: [
        {
          id: 'ENERGY_MANAGEMENT',
          title: 'Energy Management',
          instruction: 'Manage your focus energy wisely. Different abilities cost different amounts.',
          type: 'ABILITY_INTRO',
          config: {
            abilityId: 'DEEP_WORK_PUNCH',
          },
          completionConditions: [
            { type: 'ABILITY_USED', value: 3, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['energy-bar'],
          overlayText: 'Watch your energy levels!',
        },
        {
          id: 'BOSS_PHASES',
          title: 'Boss Phases',
          instruction: 'Bosses get stronger as their health decreases. Adapt your strategy!',
          type: 'BOSS_PHASE_INTRO',
          config: {},
          completionConditions: [
            { type: 'TIME_ELAPSED', value: 10000, operator: '>=' },
          ],
          isCompleted: false,
          highlightElements: ['boss-phase'],
          overlayText: 'Boss phases change combat dynamics!',
        },
      ],
      currentStep: 0,
      isCompleted: false,
      requiredLevel: 3,
      requiredAbilities: ['FOCUS_STRIKE', 'DEEP_WORK_PUNCH'],
      completionReward: {
        xp: 200,
        coins: 100,
        unlockAbility: 'SPRINT_SLASH',
      },
    };
    
    this.tutorials.set('COMBAT_BASICS', combatBasics);
    this.tutorials.set('ADVANCED_COMBAT', advancedCombat);
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  update(timestamp: number): void {
    if (!this.isRunning || this.isPaused || !this.session) {
      return;
    }
    
    // Check time-based conditions
    this.handleTimeElapsed();
  }
  
  getCurrentTutorial(): CombatTutorial | null {
    return this.currentTutorial;
  }
  
  getCurrentStep(): TutorialStep | null {
    return this.currentStep;
  }
  
  getTutorialProgress(): TutorialProgress | null {
    return this.progress;
  }
  
  skipCurrentStep(): boolean {
    if (!this.currentStep || !this.progress) {
      return false;
    }
    
    debug.info('Tutorial step skipped: %s', this.currentStep.id);
    return this.completeCurrentStep();
  }
  
  skipTutorial(): boolean {
    if (!this.currentTutorial || !this.progress) {
      return false;
    }
    
    debug.info('Tutorial skipped: %s', this.progress.tutorialId);
    this.completeTutorial();
    return true;
  }
  
  isTutorialActive(): boolean {
    return this.currentTutorial !== null && !this.progress?.isCompleted;
  }
  
  getAvailableTutorials(): CombatTutorial[] {
    return Array.from(this.tutorials.values()).filter(tutorial => 
      this.checkTutorialPrerequisites(tutorial)
    );
  }
}
