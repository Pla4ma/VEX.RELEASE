/**
 * Combat State Machine
 * 
 * Manages the flow of combat during sessions, including boss phases,
 * attack patterns, and combat state transitions.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, CombatSessionState, BossPhase, BossAttackPattern } from './types';
import type { BossEncounter } from '../types/consolidated';

const debug = createDebugger('session:v2:combat-state-machine');

// ============================================================================
// Combat State Machine
// ============================================================================

export class CombatStateMachine {
  private session: SessionV2State | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Attack pattern timing
  private currentAttackTimer: NodeJS.Timeout | null = null;
  private phaseTransitionTimer: NodeJS.Timeout | null = null;
  
  // Event cleanup
  private eventUnsubscribers: (() => void)[] = [];
  
  constructor() {
    debug.info('CombatStateMachine initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  initialize(session: SessionV2State): void {
    this.session = session;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('CombatStateMachine initialized for session: %s', session.id);
  }
  
  start(): void {
    if (!this.session || this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Start combat flow
    this.startCombatFlow();
    
    debug.info('CombatStateMachine started');
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    // Pause timers
    this.pauseTimers();
    
    debug.info('CombatStateMachine paused');
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Resume timers
    this.resumeTimers();
    
    debug.info('CombatStateMachine resumed');
  }
  
  cleanup(): void {
    // Clear timers
    this.clearTimers();
    
    // Unsubscribe from events
    this.eventUnsubscribers.forEach(unsub => unsub());
    this.eventUnsubscribers = [];
    
    this.session = null;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('CombatStateMachine cleaned up');
  }
  
  // ============================================================================
  // Combat Flow
  // ============================================================================
  
  private startCombatFlow(): void {
    if (!this.session) return;
    
    // Set initial combat state
    this.session.combatState.phase = 'COMBAT_ACTIVE';
    
    // Start first attack pattern
    this.scheduleNextAttack();
    
    // Start phase monitoring
    this.startPhaseMonitoring();
    
    debug.info('Combat flow started');
  }
  
  private scheduleNextAttack(): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Select attack pattern based on boss phase
    const attackPattern = this.selectAttackPattern();
    const attackDuration = this.getAttackDuration(attackPattern);
    
    // Schedule attack start
    const attackDelay = this.getAttackDelay();
    
    this.currentAttackTimer = setTimeout(() => {
      this.startAttack(attackPattern, attackDuration);
    }, attackDelay);
    
    debug.info('Attack scheduled: %s in %dms', attackPattern, attackDelay);
  }
  
  private startAttack(pattern: BossAttackPattern, duration: number): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    const now = Date.now();
    
    // Update combat state
    this.session.combatState.currentAttack = pattern;
    this.session.combatState.attackStartTime = now;
    this.session.combatState.attackDuration = duration;
    
    // Emit attack started event
    eventBus.publish('combat:attack_started', {
      sessionId: this.session.id,
      userId: this.session.userId,
      pattern,
      startTime: now,
      duration,
    });
    
    // Schedule attack end
    this.currentAttackTimer = setTimeout(() => {
      this.endAttack(pattern);
    }, duration);
    
    debug.info('Attack started: %s for %dms', pattern, duration);
  }
  
  private endAttack(pattern: BossAttackPattern): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Clear current attack
    this.session.combatState.currentAttack = undefined;
    this.session.combatState.attackStartTime = undefined;
    
    // Emit attack ended event
    eventBus.publish('combat:attack_ended', {
      sessionId: this.session.id,
      userId: this.session.userId,
      pattern,
    });
    
    // Schedule next attack
    this.scheduleNextAttack();
    
    debug.info('Attack ended: %s', pattern);
  }
  
  private startPhaseMonitoring(): void {
    if (!this.session) return;
    
    // Monitor boss health and phase changes
    this.phaseTransitionTimer = setInterval(() => {
      this.checkPhaseTransition();
    }, 1000); // Check every second
  }
  
  private checkPhaseTransition(): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    const encounter = this.session.currentEncounter;
    if (!encounter) return;
    
    const currentPhase = encounter.currentPhase;
    const newPhase = this.calculateBossPhase(
      encounter.bossCurrentHealth,
      encounter.bossMaxHealth,
      Date.now() - encounter.encounterStartedAt,
      encounter.expiresAt - encounter.encounterStartedAt
    );
    
    if (newPhase !== currentPhase) {
      this.transitionToPhase(newPhase, currentPhase);
    }
  }
  
  private transitionToPhase(newPhase: BossPhase, previousPhase: BossPhase): void {
    if (!this.session) return;
    
    // Update boss encounter
    if (this.session.currentEncounter) {
      this.session.currentEncounter.currentPhase = newPhase;
    }
    
    // Update combat state
    this.updateCombatStateForPhase(newPhase);
    
    // Emit phase change event
    eventBus.publish('combat:boss_phase_changed', {
      sessionId: this.session.id,
      userId: this.session.userId,
      newPhase,
      previousPhase,
      healthPercent: this.session.currentEncounter?.percentHealthRemaining || 100,
    });
    
    debug.info('Phase transition: %s -> %s', previousPhase, newPhase);
  }
  
  private updateCombatStateForPhase(phase: BossPhase): void {
    if (!this.session) return;
    
    switch (phase) {
      case 'CALM':
        this.session.combatState.phase = 'COMBAT_ACTIVE';
        break;
      case 'AGITATED':
        this.session.combatState.phase = 'COMBAT_ACTIVE';
        // Increase attack frequency
        break;
      case 'ENRAGED':
        this.session.combatState.phase = 'BOSS_RAGE';
        // Further increase attack frequency and damage
        break;
      case 'DESPERATE':
        this.session.combatState.phase = 'NEAR_DEATH';
        // Maximum attack frequency and damage
        break;
    }
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private selectAttackPattern(): BossAttackPattern {
    if (!this.session || !this.session.currentEncounter) {
      return 'DISTRACTION_WAVE'; // Default
    }
    
    const phase = this.session.currentEncounter.currentPhase;
    const userLevel = 1; // Would get from progression system
    
    // Weight patterns based on phase
    const patterns: BossAttackPattern[] = ['DISTRACTION_WAVE', 'PROCRASTINATION_BEAM', 'NOTIFICATION_BLAST', 'SOCIAL_MEDIA_TRAP', 'MULTITASKING_TEMPEST'];
    let weights: number[];
    
    switch (phase) {
      case 'CALM':
        weights = [0.5, 0.2, 0.2, 0.1, 0.0]; // Easier patterns
        break;
      case 'AGITATED':
        weights = [0.3, 0.3, 0.2, 0.2, 0.0];
        break;
      case 'ENRAGED':
        weights = [0.1, 0.3, 0.2, 0.3, 0.1];
        break;
      case 'DESPERATE':
        weights = [0.0, 0.2, 0.2, 0.3, 0.3]; // Hardest patterns
        break;
      default:
        weights = [0.2, 0.2, 0.2, 0.2, 0.2];
    }
    
    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < patterns.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return patterns[i];
      }
    }
    
    return patterns[0];
  }
  
  private getAttackDuration(pattern: BossAttackPattern): number {
    const durations: Record<BossAttackPattern, number> = {
      'DISTRACTION_WAVE': 30000, // 30 seconds
      'PROCRASTINATION_BEAM': 60000, // 60 seconds
      'NOTIFICATION_BLAST': 20000, // 20 seconds
      'SOCIAL_MEDIA_TRAP': 45000, // 45 seconds
      'MULTITASKING_TEMPEST': 90000, // 90 seconds
    };
    
    return durations[pattern] || 30000;
  }
  
  private getAttackDelay(): number {
    if (!this.session) return 10000;
    
    // Base delay between attacks
    let delay = 10000; // 10 seconds
    
    // Adjust based on boss phase
    if (this.session.currentEncounter) {
      switch (this.session.currentEncounter.currentPhase) {
        case 'AGITATED':
          delay = 8000; // 8 seconds
          break;
        case 'ENRAGED':
          delay = 6000; // 6 seconds
          break;
        case 'DESPERATE':
          delay = 4000; // 4 seconds
          break;
      }
    }
    
    // Add some randomness (±2 seconds)
    delay += (Math.random() - 0.5) * 4000;
    
    return Math.max(2000, delay); // Minimum 2 seconds
  }
  
  private calculateBossPhase(
    currentHealth: number,
    maxHealth: number,
    timeElapsedMs: number,
    timeLimitMs: number
  ): BossPhase {
    const healthPercent = currentHealth / maxHealth;
    const timePercent = timeElapsedMs / timeLimitMs;
    
    // Health-based phases
    if (healthPercent <= 0.15) {
      return 'DESPERATE';
    }
    if (healthPercent <= 0.4) {
      return 'ENRAGED';
    }
    if (healthPercent <= 0.7) {
      return 'AGITATED';
    }
    
    // Time-based urgency
    if (timePercent > 0.8) {
      return 'ENRAGED';
    }
    
    return 'CALM';
  }
  
  // ============================================================================
  // Timer Management
  // ============================================================================
  
  private pauseTimers(): void {
    // Store remaining time for later resume
    // This is a simplified version - in production, you'd want to track exact remaining time
    if (this.currentAttackTimer) {
      clearTimeout(this.currentAttackTimer);
      this.currentAttackTimer = null;
    }
  }
  
  private resumeTimers(): void {
    // Resume with adjusted timing
    // This is simplified - in production, you'd restore exact remaining time
    this.scheduleNextAttack();
  }
  
  private clearTimers(): void {
    if (this.currentAttackTimer) {
      clearTimeout(this.currentAttackTimer);
      this.currentAttackTimer = null;
    }
    
    if (this.phaseTransitionTimer) {
      clearInterval(this.phaseTransitionTimer);
      this.phaseTransitionTimer = null;
    }
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  getCurrentAttack(): BossAttackPattern | undefined {
    return this.session?.combatState.currentAttack;
  }
  
  getAttackTimeRemaining(): number {
    if (!this.session || !this.session.combatState.attackStartTime) {
      return 0;
    }
    
    const elapsed = Date.now() - this.session.combatState.attackStartTime;
    return Math.max(0, this.session.combatState.attackDuration - elapsed);
  }
  
  isAttackActive(): boolean {
    return !!this.session?.combatState.currentAttack;
  }
  
  getCombatPhase(): string {
    return this.session?.combatState.phase || 'PREPARING';
  }
}
