/**
 * Session V2 Orchestrator
 * 
 * Combat-first session orchestrator that replaces passive observation with active gameplay.
 * Integrates combat mechanics, ability systems, and dodge mechanics into the core session flow.
 */

import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionConfig, SessionV2State, CombatSessionState, UserResources, CombatAction } from './types';
import type { BossEncounter, CombatAbility, BossPhase, BossAttackPattern } from '../types/consolidated';
import { CombatStateMachine } from './CombatStateMachine';
import { AbilitySystem } from './AbilitySystem';
import { DodgeMechanic } from './DodgeMechanic';
import { PhaseManager } from './PhaseManager';

const debug = createDebugger('session:v2:orchestrator');

// ============================================================================
// Session V2 Orchestrator
// ============================================================================

export class SessionV2Orchestrator {
  private session: SessionV2State | null = null;
  private userId: string | null = null;
  
  // Combat subsystems
  private combatStateMachine: CombatStateMachine;
  private abilitySystem: AbilitySystem;
  private dodgeMechanic: DodgeMechanic;
  private phaseManager: PhaseManager;
  
  // Timers and intervals
  private updateInterval: NodeJS.Timeout | null = null;
  private energyRegenInterval: NodeJS.Timeout | null = null;
  
  // Event cleanup
  private eventUnsubscribers: (() => void)[] = [];
  
  constructor() {
    this.combatStateMachine = new CombatStateMachine();
    this.abilitySystem = new AbilitySystem();
    this.dodgeMechanic = new DodgeMechanic();
    this.phaseManager = new PhaseManager();
    
    debug.info('SessionV2Orchestrator initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }
    
    this.cleanup();
    this.userId = userId;
    debug.info('SessionV2Orchestrator user set: %s', userId);
  }
  
  async createSession(config: SessionConfig): Promise<SessionV2State> {
    if (!this.userId) {
      throw new Error('SessionV2Orchestrator: No user set');
    }
    
    const sessionId = uuidv4();
    const now = Date.now();
    
    // Initialize base session state
    this.session = {
      id: sessionId,
      userId: this.userId,
      status: 'PREPARING',
      phase: 'PREPARATION',
      config,
      
      // Timing
      remainingTime: config.duration * 1000,
      totalDuration: config.duration * 1000,
      elapsedTime: 0,
      effectiveTime: 0,
      pausedTime: 0,
      totalPausedTime: 0,
      totalBackgroundTime: 0,
      
      // Intervals
      currentInterval: 1,
      totalIntervals: config.intervals,
      intervalsCompleted: 0,
      
      // Interruptions
      interruptions: 0,
      pauses: 0,
      backgroundTime: 0,
      
      // Scoring
      baseScore: 0,
      timeBonus: 0,
      streakBonus: 0,
      focusQuality: 100,
      completionPercentage: 0,
      damagePoints: 0,
      penaltyMultiplier: 1,
      
      // Recovery
      recoveryAttempts: 0,
      maxRecoveryAttempts: 3,
      canRecover: true,
      
      // State tracking
      conflictStatus: 'NONE',
      storageStatus: 'HEALTHY',
      deviceId: 'device-placeholder',
      appVersion: '2.0.0',
      osVersion: 'unknown',
      antiCheatStatus: 'CLEAN',
      antiCheatFlags: [],
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      
      // Dirty flag
      isDirty: true,
      
      // Combat-specific additions
      combatState: {
        phase: 'PREPARING',
        attackDuration: 0,
        abilitiesUsed: 0,
        damageDealt: 0,
        energyConsumed: 0,
        isPlayerTurn: true,
        nextActionAvailableAt: now,
      },
      userResources: {
        focusEnergy: 100,
        maxFocusEnergy: 100,
        energyRegenRate: 1,
        specialCharges: {},
      },
      combatHistory: [],
      activeAbilities: [],
      abilityCooldowns: {},
      dodgeAttempts: 0,
      successfulDodges: 0,
      dodgeStreak: 0,
      comboCount: 0,
      lastActionTime: 0,
      comboMultiplier: 1,
    };
    
    // Initialize combat systems
    await this.initializeCombatSystems();
    
    // Setup event listeners
    this.setupEventListeners();
    
    debug.info('Session V2 created: %s', sessionId);
    return this.session;
  }
  
  async startSession(): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }
    
    this.session.status = 'STARTING';
    this.session.phase = 'FOCUS';
    this.session.startedAt = Date.now();
    this.session.updatedAt = Date.now();
    
    // Start combat systems
    this.combatStateMachine.start();
    this.abilitySystem.start();
    this.dodgeMechanic.start();
    
    // Start update loops
    this.startUpdateLoops();
    
    // Emit session started event
    eventBus.publish('session:v2:started', {
      sessionId: this.session.id,
      userId: this.session.userId,
      combatEnabled: true,
    });
    
    debug.info('Session V2 started: %s', this.session.id);
  }
  
  async pauseSession(reason?: string): Promise<void> {
    if (!this.session || this.session.status !== 'ACTIVE') {
      return;
    }
    
    this.session.status = 'PAUSED';
    this.session.pausedAt = Date.now();
    this.session.pauses++;
    
    // Pause combat systems
    this.combatStateMachine.pause();
    this.abilitySystem.pause();
    this.dodgeMechanic.pause();
    
    // Stop update loops
    this.stopUpdateLoops();
    
    eventBus.publish('session:v2:paused', {
      sessionId: this.session.id,
      userId: this.session.userId,
      reason,
    });
    
    debug.info('Session V2 paused: %s', this.session.id);
  }
  
  async resumeSession(): Promise<void> {
    if (!this.session || this.session.status !== 'PAUSED') {
      return;
    }
    
    const now = Date.now();
    const pausedDuration = now - (this.session.pausedAt || now);
    
    this.session.status = 'ACTIVE';
    this.session.resumedAt = now;
    this.session.pausedTime += pausedDuration;
    this.session.updatedAt = now;
    
    // Resume combat systems
    this.combatStateMachine.resume();
    this.abilitySystem.resume();
    this.dodgeMechanic.resume();
    
    // Restart update loops
    this.startUpdateLoops();
    
    eventBus.publish('session:v2:resumed', {
      sessionId: this.session.id,
      userId: this.session.userId,
      pausedDuration,
    });
    
    debug.info('Session V2 resumed: %s', this.session.id);
  }
  
  async completeSession(): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }
    
    this.session.status = 'COMPLETED';
    this.session.phase = 'REVIEW';
    this.session.completedAt = Date.now();
    this.session.updatedAt = Date.now();
    
    // Calculate final scores
    await this.calculateFinalScores();
    
    // Stop all systems
    this.cleanup();
    
    // Emit completion event
    eventBus.publish('session:v2:completed', {
      sessionId: this.session.id,
      userId: this.session.userId,
      summary: this.generateSessionSummary(),
    });
    
    debug.info('Session V2 completed: %s', this.session.id);
  }
  
  // ============================================================================
  // Combat Actions
  // ============================================================================
  
  async useAbility(abilityId: string): Promise<boolean> {
    if (!this.session || this.session.status !== 'ACTIVE') {
      return false;
    }
    
    const result = await this.abilitySystem.useAbility(
      abilityId,
      this.session.userResources,
      this.session.abilityCooldowns,
      this.session.combatState
    );
    
    if (result.success) {
      // Update session state
      this.session.userResources = result.newResources;
      this.session.abilityCooldowns = result.newCooldowns;
      this.session.combatState.abilitiesUsed++;
      this.session.combatState.energyConsumed += result.energyCost;
      
      // Record combat action
      this.recordCombatAction({
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'ABILITY_USED',
        data: {
          abilityId,
          damage: result.damage,
          energyCost: result.energyCost,
        },
      });
      
      // Update combo
      this.updateCombo();
      
      // Emit event
      eventBus.publish('session:v2:ability_used', {
        sessionId: this.session.id,
        userId: this.session.userId,
        abilityId,
        damage: result.damage,
        energyCost: result.energyCost,
        comboCount: this.session.comboCount,
      });
      
      debug.info('Ability used: %s, damage: %d', abilityId, result.damage);
    }
    
    return result.success;
  }
  
  async attemptDodge(): Promise<boolean> {
    if (!this.session || this.session.status !== 'ACTIVE') {
      return false;
    }
    
    const result = await this.dodgeMechanic.attemptDodge(
      this.session.combatState.currentAttack,
      this.session.combatHistory
    );
    
    if (result.success !== undefined) {
      // Update dodge stats
      this.session.dodgeAttempts++;
      if (result.success) {
        this.session.successfulDodges++;
        this.session.dodgeStreak++;
      } else {
        this.session.dodgeStreak = 0;
      }
      
      // Record combat action
      this.recordCombatAction({
        id: uuidv4(),
        timestamp: Date.now(),
        type: result.success ? 'DODGE_SUCCESS' : 'DODGE_FAILED',
        data: {
          attackPattern: this.session.combatState.currentAttack,
        },
      });
      
      // Emit event
      eventBus.publish('session:v2:dodge_attempted', {
        sessionId: this.session.id,
        userId: this.session.userId,
        attackPattern: this.session.combatState.currentAttack!,
        success: result.success,
        timing: result.timing,
      });
      
      debug.info('Dodge attempted: %s, success: %s', this.session.combatState.currentAttack, result.success);
    }
    
    return result.success ?? false;
  }
  
  // ============================================================================
  // Private Methods
  // ============================================================================
  
  private async initializeCombatSystems(): Promise<void> {
    if (!this.session) return;
    
    // Initialize combat abilities based on user level
    this.session.activeAbilities = await this.abilitySystem.getAvailableAbilities(
      this.session.userId,
      this.session
    );
    
    // Initialize combat state machine
    this.combatStateMachine.initialize(this.session);
    
    // Initialize dodge mechanic
    this.dodgeMechanic.initialize(this.session);
    
    // Initialize phase manager
    this.phaseManager.initialize(this.session);
  }
  
  private setupEventListeners(): void {
    if (!this.session) return;
    
    // Combat state changes
    const combatStateUnsub = eventBus.subscribe('combat:state_changed', (event) => {
      if (event.sessionId === this.session?.id) {
        this.session!.combatState = event.newState;
        this.session!.updatedAt = Date.now();
      }
    });
    
    // Boss phase changes
    const bossPhaseUnsub = eventBus.subscribe('combat:boss_phase_changed', (event) => {
      if (event.sessionId === this.session?.id) {
        this.handleBossPhaseChange(event.newPhase, event.previousPhase);
      }
    });
    
    // Attack patterns
    const attackUnsub = eventBus.subscribe('combat:attack_started', (event) => {
      if (event.sessionId === this.session?.id) {
        this.session!.combatState.currentAttack = event.pattern;
        this.session!.combatState.attackStartTime = event.startTime;
        this.session!.combatState.attackDuration = event.duration;
      }
    });
    
    this.eventUnsubscribers.push(combatStateUnsub, bossPhaseUnsub, attackUnsub);
  }
  
  private startUpdateLoops(): void {
    // Main update loop (100ms)
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
    
    // Energy regeneration loop (1000ms)
    this.energyRegenInterval = setInterval(() => {
      this.regenerateEnergy();
    }, 1000);
  }
  
  private stopUpdateLoops(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.energyRegenInterval) {
      clearInterval(this.energyRegenInterval);
      this.energyRegenInterval = null;
    }
  }
  
  private update(): void {
    if (!this.session || this.session.status !== 'ACTIVE') {
      return;
    }
    
    const now = Date.now();
    
    // Update timing
    this.session.elapsedTime = now - (this.session.startedAt || now);
    this.session.effectiveTime = this.session.elapsedTime - this.session.pausedTime;
    this.session.remainingTime = Math.max(0, this.session.totalDuration - this.session.elapsedTime);
    this.session.completionPercentage = (this.session.elapsedTime / this.session.totalDuration) * 100;
    
    // Update combat systems
    this.combatStateMachine.update(now);
    this.abilitySystem.update(now);
    this.dodgeMechanic.update(now);
    this.phaseManager.update(now);
    
    // Check for session completion
    if (this.session.remainingTime <= 0) {
      void this.completeSession();
    }
    
    // Update dirty flag
    this.session.updatedAt = now;
    this.session.isDirty = true;
  }
  
  private regenerateEnergy(): void {
    if (!this.session || this.session.status !== 'ACTIVE') {
      return;
    }
    
    const { focusEnergy, maxFocusEnergy, energyRegenRate } = this.session.userResources;
    const newEnergy = Math.min(maxFocusEnergy, focusEnergy + energyRegenRate);
    
    if (newEnergy !== focusEnergy) {
      this.session.userResources.focusEnergy = newEnergy;
      this.session.updatedAt = Date.now();
      
      eventBus.publish('session:v2:energy_regen', {
        sessionId: this.session.id,
        userId: this.session.userId,
        previousEnergy: focusEnergy,
        newEnergy,
      });
    }
  }
  
  private updateCombo(): void {
    if (!this.session) return;
    
    const now = Date.now();
    const timeSinceLastAction = now - this.session.lastActionTime;
    
    // Reset combo if too much time has passed (10 seconds)
    if (timeSinceLastAction > 10000) {
      this.session.comboCount = 0;
      this.session.comboMultiplier = 1;
    } else {
      // Increment combo
      this.session.comboCount++;
      
      // Calculate multiplier (max 3x)
      this.session.comboMultiplier = Math.min(3, 1 + (this.session.comboCount - 1) * 0.2);
      
      // Emit combo event
      if (this.session.comboCount > 1) {
        eventBus.publish('session:v2:combo_triggered', {
          sessionId: this.session.id,
          userId: this.session.userId,
          comboCount: this.session.comboCount,
          multiplier: this.session.comboMultiplier,
          bonusDamage: Math.floor((this.session.comboMultiplier - 1) * 10),
        });
      }
    }
    
    this.session.lastActionTime = now;
  }
  
  private recordCombatAction(action: CombatAction): void {
    if (!this.session) return;
    
    this.session.combatHistory.push(action);
    
    // Keep only last 50 actions to prevent memory bloat
    if (this.session.combatHistory.length > 50) {
      this.session.combatHistory = this.session.combatHistory.slice(-50);
    }
  }
  
  private handleBossPhaseChange(newPhase: BossPhase, previousPhase: BossPhase): void {
    if (!this.session) return;
    
    // Update combat state based on boss phase
    switch (newPhase) {
      case 'AGITATED':
        this.session.combatState.phase = 'COMBAT_ACTIVE';
        break;
      case 'ENRAGED':
        this.session.combatState.phase = 'BOSS_RAGE';
        break;
      case 'DESPERATE':
        this.session.combatState.phase = 'NEAR_DEATH';
        break;
      default:
        this.session.combatState.phase = 'COMBAT_ACTIVE';
    }
    
    eventBus.publish('session:v2:phase_changed', {
      sessionId: this.session.id,
      userId: this.session.userId,
      newPhase,
      previousPhase,
      healthPercent: this.session.currentEncounter?.percentHealthRemaining || 100,
    });
  }
  
  private async calculateFinalScores(): Promise<void> {
    if (!this.session) return;
    
    // Base score from session completion
    this.session.baseScore = Math.floor(this.session.completionPercentage * 10);
    
    // Combat bonuses
    const combatBonus = Math.floor(
      this.session.combatState.damageDealt * 0.1 +
      this.session.combatState.abilitiesUsed * 5 +
      (this.session.successfulDodges / Math.max(1, this.session.dodgeAttempts)) * 50
    );
    
    // Combo bonus
    const comboBonus = Math.floor((this.session.comboMultiplier - 1) * 20);
    
    // Time bonus
    const timeBonus = this.session.completionPercentage >= 100 ? 50 : 
                     this.session.completionPercentage >= 90 ? 25 : 0;
    
    this.session.timeBonus = timeBonus + combatBonus + comboBonus;
    
    // Calculate final score
    this.session.finalScore = this.session.baseScore + this.session.timeBonus + this.session.streakBonus;
    
    // Determine grade
    this.session.grade = this.calculateGrade(this.session.finalScore);
  }
  
  private calculateGrade(score: number): string {
    if (score >= 450) return 'S';
    if (score >= 400) return 'A';
    if (score >= 350) return 'B';
    if (score >= 300) return 'C';
    if (score >= 250) return 'D';
    return 'F';
  }
  
  private generateSessionSummary() {
    if (!this.session) return null;
    
    return {
      sessionId: this.session.id,
      userId: this.session.userId,
      duration: this.session.totalDuration,
      effectiveDuration: this.session.effectiveTime,
      completionPercentage: this.session.completionPercentage,
      focusQuality: this.session.focusQuality,
      purityScore: this.session.focusQuality, // For now, same as focusQuality
      interruptions: this.session.interruptions,
      baseScore: this.session.baseScore,
      finalScore: this.session.finalScore,
      grade: this.session.grade,
      xpEarned: Math.floor(this.session.finalScore * 2),
      levelUp: false, // Would be calculated by progression system
      bossDamageDealt: this.session.combatState.damageDealt,
      bossDefeated: this.session.currentEncounter?.status === 'VICTORY',
      startedAt: this.session.startedAt,
      completedAt: this.session.completedAt,
      wasAbandoned: false,
      hadInterruptions: this.session.interruptions > 0,
      usedRecovery: this.session.recoveryAttempts > 0,
    };
  }
  
  private cleanup(): void {
    // Stop update loops
    this.stopUpdateLoops();
    
    // Cleanup combat systems
    this.combatStateMachine.cleanup();
    this.abilitySystem.cleanup();
    this.dodgeMechanic.cleanup();
    this.phaseManager.cleanup();
    
    // Unsubscribe from events
    this.eventUnsubscribers.forEach(unsub => unsub());
    this.eventUnsubscribers = [];
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  getSession(): SessionV2State | null {
    return this.session;
  }
  
  getCombatState(): CombatSessionState | null {
    return this.session?.combatState || null;
  }
  
  getUserResources(): UserResources | null {
    return this.session?.userResources || null;
  }
  
  getAvailableAbilities(): CombatAbility[] {
    return this.session?.activeAbilities || [];
  }
  
  getAbilityCooldowns(): Record<string, number> {
    return this.session?.abilityCooldowns || {};
  }
  
  getComboCount(): number {
    return this.session?.comboCount || 0;
  }
  
  getComboMultiplier(): number {
    return this.session?.comboMultiplier || 1;
  }
}
