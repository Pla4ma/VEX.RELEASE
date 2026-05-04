/**
 * Dodge Mechanic
 * 
 * Handles dodge mechanics during combat, including timing-based dodges,
 * purity-based dodges, and pattern-matching dodges.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, BossAttackPattern, DodgeCondition } from './types';

const debug = createDebugger('session:v2:dodge-mechanic');

// ============================================================================
// Dodge Mechanic
// ============================================================================

export interface DodgeResult {
  success?: boolean;
  timing?: number;
  message?: string;
}

export class DodgeMechanic {
  private session: SessionV2State | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Dodge timing
  private dodgeWindowStart: number | null = null;
  private currentDodgeWindow: number = 0;
  
  constructor() {
    debug.info('DodgeMechanic initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  initialize(session: SessionV2State): void {
    this.session = session;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('DodgeMechanic initialized for session: %s', session.id);
  }
  
  start(): void {
    if (!this.session || this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    debug.info('DodgeMechanic started');
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    debug.info('DodgeMechanic paused');
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    debug.info('DodgeMechanic resumed');
  }
  
  cleanup(): void {
    this.session = null;
    this.isRunning = false;
    this.isPaused = false;
    this.dodgeWindowStart = null;
    this.currentDodgeWindow = 0;
    
    debug.info('DodgeMechanic cleaned up');
  }
  
  // ============================================================================
  // Dodge Actions
  // ============================================================================
  
  async attemptDodge(
    currentAttack: BossAttackPattern | undefined,
    combatHistory: any[]
  ): Promise<DodgeResult> {
    if (!this.session || !this.isRunning || this.isPaused || !currentAttack) {
      return { success: false, message: 'Cannot dodge now' };
    }
    
    const now = Date.now();
    const dodgeCondition = this.getDodgeCondition(currentAttack);
    
    let success = false;
    let timing = 0;
    
    switch (dodgeCondition.type) {
      case 'TAP_TIMING':
        success = this.checkTimingDodge(now, dodgeCondition.window || 3000);
        timing = now - (this.dodgeWindowStart || now);
        break;
        
      case 'MAINTAIN_PURITY':
        success = this.checkPurityDodge(dodgeCondition.threshold || 80);
        break;
        
      case 'NO_PAUSE':
        success = this.checkNoPauseDodge();
        break;
        
      case 'NO_BACKGROUND':
        success = this.checkNoBackgroundDodge();
        break;
        
      case 'PATTERN_MATCH':
        success = this.checkPatternDodge(dodgeCondition.pattern || [], combatHistory);
        break;
        
      default:
        success = false;
    }
    
    const message = this.generateDodgeMessage(currentAttack, success, dodgeCondition.type);
    
    // Emit dodge event
    eventBus.publish('combat:dodge_attempted', {
      sessionId: this.session.id,
      userId: this.session.userId,
      attackPattern: currentAttack,
      success,
      timing,
      dodgeType: dodgeCondition.type,
    });
    
    debug.info('Dodge attempted: %s, success: %s, type: %s', currentAttack, success, dodgeCondition.type);
    
    return { success, timing, message };
  }
  
  // ============================================================================
  // Dodge Condition Checks
  // ============================================================================
  
  private checkTimingDodge(now: number, window: number): boolean {
    if (!this.dodgeWindowStart) {
      return false;
    }
    
    const elapsed = now - this.dodgeWindowStart;
    return elapsed >= window * 0.8 && elapsed <= window * 1.2; // 80% to 120% of target
  }
  
  private checkPurityDodge(threshold: number): boolean {
    if (!this.session) return false;
    
    // Get current purity score from session metrics
    const currentPurity = this.session.focusQuality; // Using focusQuality as proxy
    
    return currentPurity >= threshold;
  }
  
  private checkNoPauseDodge(): boolean {
    if (!this.session) return false;
    
    // Check if session was paused during current attack
    return this.session.pauses === 0;
  }
  
  private checkNoBackgroundDodge(): boolean {
    if (!this.session) return false;
    
    // Check if app went to background during current attack
    return this.session.backgroundTime === 0;
  }
  
  private checkPatternDodge(requiredPattern: string[], combatHistory: any[]): boolean {
    // Get recent actions from combat history
    const recentActions = combatHistory.slice(-5); // Last 5 actions
    
    // Extract action types
    const actionPattern = recentActions.map(action => action.type);
    
    // Check if pattern matches required pattern
    if (requiredPattern.length === 0) return true;
    
    for (let i = 0; i <= actionPattern.length - requiredPattern.length; i++) {
      const slice = actionPattern.slice(i, i + requiredPattern.length);
      if (this.arraysEqual(slice, requiredPattern)) {
        return true;
      }
    }
    
    return false;
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private getDodgeCondition(attackPattern: BossAttackPattern): DodgeCondition {
    const conditions: Record<BossAttackPattern, DodgeCondition> = {
      'DISTRACTION_WAVE': {
        type: 'MAINTAIN_PURITY',
        threshold: 75,
        window: 3000,
      },
      'PROCRASTINATION_BEAM': {
        type: 'TAP_TIMING',
        window: 2000,
      },
      'NOTIFICATION_BLAST': {
        type: 'NO_PAUSE',
        window: 1000,
      },
      'SOCIAL_MEDIA_TRAP': {
        type: 'NO_BACKGROUND',
        window: 1500,
      },
      'MULTITASKING_TEMPEST': {
        type: 'PATTERN_MATCH',
        pattern: ['ABILITY_USED', 'ABILITY_USED'],
        window: 4000,
      },
    };
    
    return conditions[attackPattern] || { type: 'TAP_TIMING', window: 2000 };
  }
  
  private generateDodgeMessage(
    attackPattern: BossAttackPattern,
    success: boolean,
    dodgeType: string
  ): string {
    const attackNames: Record<BossAttackPattern, string> = {
      'DISTRACTION_WAVE': 'Distraction Wave',
      'PROCRASTINATION_BEAM': 'Procrastination Beam',
      'NOTIFICATION_BLAST': 'Notification Blast',
      'SOCIAL_MEDIA_TRAP': 'Social Media Trap',
      'MULTITASKING_TEMPEST': 'Multitasking Tempest',
    };
    
    const attackName = attackNames[attackPattern];
    
    if (success) {
      return `Perfect dodge! You avoided the ${attackName}!`;
    } else {
      const dodgeHints: Record<string, string> = {
        'TAP_TIMING': 'Try tapping at the right moment!',
        'MAINTAIN_PURITY': 'Maintain high focus purity!',
        'NO_PAUSE': 'Don\'t pause during the attack!',
        'NO_BACKGROUND': 'Stay in the app!',
        'PATTERN_MATCH': 'Follow the ability pattern!',
      };
      
      return `Hit by ${attackName}! ${dodgeHints[dodgeType] || ''}`;
    }
  }
  
  private arraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  
  // ============================================================================
  // Dodge Window Management
  // ============================================================================
  
  startDodgeWindow(attackPattern: BossAttackPattern, duration: number): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.dodgeWindowStart = Date.now();
    this.currentDodgeWindow = duration;
    
    debug.info('Dodge window started: %s for %dms', attackPattern, duration);
  }
  
  endDodgeWindow(): void {
    this.dodgeWindowStart = null;
    this.currentDodgeWindow = 0;
    
    debug.info('Dodge window ended');
  }
  
  getDodgeWindowTimeRemaining(): number {
    if (!this.dodgeWindowStart) {
      return 0;
    }
    
    const elapsed = Date.now() - this.dodgeWindowStart;
    return Math.max(0, this.currentDodgeWindow - elapsed);
  }
  
  isDodgeWindowActive(): boolean {
    return this.getDodgeWindowTimeRemaining() > 0;
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  update(timestamp: number): void {
    if (!this.isRunning || this.isPaused || !this.session) {
      return;
    }
    
    // Check if dodge window should end
    if (this.isDodgeWindowActive() && this.getDodgeWindowTimeRemaining() <= 0) {
      this.endDodgeWindow();
    }
  }
  
  getDodgeStats(): { attempts: number; successes: number; successRate: number } {
    if (!this.session) {
      return { attempts: 0, successes: 0, successRate: 0 };
    }
    
    const attempts = this.session.dodgeAttempts;
    const successes = this.session.successfulDodges;
    const successRate = attempts > 0 ? (successes / attempts) * 100 : 0;
    
    return { attempts, successes, successRate };
  }
}
