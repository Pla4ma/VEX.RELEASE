/**
 * Phase Manager
 * 
 * Manages session phases and transitions between focus, breaks, and review.
 * Integrates with combat mechanics to provide seamless phase transitions.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, SessionPhase } from './types';

const debug = createDebugger('session:v2:phase-manager');

// ============================================================================
// Phase Manager
// ============================================================================

export class PhaseManager {
  private session: SessionV2State | null = null;
  private isRunning = false;
  private isPaused = false;
  
  // Phase timers
  private phaseTimer: NodeJS.Timeout | null = null;
  private phaseStartTime: number | null = null;
  
  constructor() {
    debug.info('PhaseManager initialized');
  }
  
  // ============================================================================
  // Lifecycle Methods
  // ============================================================================
  
  initialize(session: SessionV2State): void {
    this.session = session;
    this.isRunning = false;
    this.isPaused = false;
    
    debug.info('PhaseManager initialized for session: %s', session.id);
  }
  
  start(): void {
    if (!this.session || this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Start initial phase
    this.startPhase(this.session.phase);
    
    debug.info('PhaseManager started');
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    // Pause phase timer
    this.pausePhaseTimer();
    
    debug.info('PhaseManager paused');
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Resume phase timer
    this.resumePhaseTimer();
    
    debug.info('PhaseManager resumed');
  }
  
  cleanup(): void {
    // Clear phase timer
    this.clearPhaseTimer();
    
    this.session = null;
    this.isRunning = false;
    this.isPaused = false;
    this.phaseStartTime = null;
    
    debug.info('PhaseManager cleaned up');
  }
  
  // ============================================================================
  // Phase Management
  // ============================================================================
  
  private startPhase(phase: SessionPhase): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    // Clear previous phase timer
    this.clearPhaseTimer();
    
    // Update session phase
    this.session.phase = phase;
    this.phaseStartTime = Date.now();
    
    // Emit phase started event
    eventBus.publish('session:phase_started', {
      sessionId: this.session.id,
      userId: this.session.userId,
      phase,
      previousPhase: phase, // Would track actual previous phase
    });
    
    // Set phase duration and timer
    const phaseDuration = this.getPhaseDuration(phase);
    if (phaseDuration > 0) {
      this.phaseTimer = setTimeout(() => {
        this.endPhase(phase);
      }, phaseDuration);
    }
    
    debug.info('Phase started: %s for %dms', phase, phaseDuration);
  }
  
  private endPhase(currentPhase: SessionPhase): void {
    if (!this.session || !this.isRunning || this.isPaused) {
      return;
    }
    
    const nextPhase = this.getNextPhase(currentPhase);
    
    // Emit phase ended event
    eventBus.publish('session:phase_ended', {
      sessionId: this.session.id,
      userId: this.session.userId,
      phase: currentPhase,
      nextPhase,
      duration: this.phaseStartTime ? Date.now() - this.phaseStartTime : 0,
    });
    
    // Start next phase
    if (nextPhase) {
      this.startPhase(nextPhase);
    } else {
      // Session complete
      this.handleSessionComplete();
    }
    
    debug.info('Phase ended: %s -> %s', currentPhase, nextPhase);
  }
  
  private getNextPhase(currentPhase: SessionPhase): SessionPhase | null {
    if (!this.session) return null;
    
    switch (currentPhase) {
      case 'PREPARATION':
        return 'FOCUS';
        
      case 'FOCUS':
        // Check if this was the last interval
        if (this.session.currentInterval >= this.session.totalIntervals) {
          return 'REVIEW';
        } else {
          // Check if this should be a long break
          const isLongBreakInterval = this.session.currentInterval % this.session.config.longBreakInterval === 0;
          return isLongBreakInterval ? 'LONG_BREAK' : 'SHORT_BREAK';
        }
        
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        // Increment interval and go back to focus
        this.session.currentInterval++;
        this.session.intervalsCompleted++;
        return 'FOCUS';
        
      case 'REVIEW':
        return null; // Session complete
        
      default:
        return 'FOCUS';
    }
  }
  
  private getPhaseDuration(phase: SessionPhase): number {
    if (!this.session) return 0;
    
    switch (phase) {
      case 'PREPARATION':
        return 30000; // 30 seconds
        
      case 'FOCUS':
        return this.session.config.duration * 1000; // Convert to milliseconds
        
      case 'SHORT_BREAK':
        return this.session.config.breakDuration * 1000;
        
      case 'LONG_BREAK':
        return this.session.config.longBreakDuration * 1000;
        
      case 'REVIEW':
        return 60000; // 1 minute
        
      default:
        return 0;
    }
  }
  
  private handleSessionComplete(): void {
    if (!this.session) return;
    
    // Emit session complete event
    eventBus.publish('session:phases_complete', {
      sessionId: this.session.id,
      userId: this.session.userId,
      totalDuration: Date.now() - (this.session.startedAt || Date.now()),
      intervalsCompleted: this.session.intervalsCompleted,
    });
    
    debug.info('All phases completed for session: %s', this.session.id);
  }
  
  // ============================================================================
  // Timer Management
  // ============================================================================
  
  private pausePhaseTimer(): void {
    if (!this.phaseTimer || !this.phaseStartTime) {
      return;
    }
    
    // Clear timer and store remaining time
    clearTimeout(this.phaseTimer);
    this.phaseTimer = null;
    
    // Store remaining time (simplified - would need to track exact remaining time)
    const elapsed = Date.now() - this.phaseStartTime;
    const totalDuration = this.getPhaseDuration(this.session?.phase || 'FOCUS');
    const remaining = Math.max(0, totalDuration - elapsed);
    
    // This is simplified - in production, you'd store exact pause time
  }
  
  private resumePhaseTimer(): void {
    if (!this.session || !this.phaseStartTime) {
      return;
    }
    
    // Calculate remaining time and restart timer
    const elapsed = Date.now() - this.phaseStartTime;
    const totalDuration = this.getPhaseDuration(this.session.phase);
    const remaining = Math.max(0, totalDuration - elapsed);
    
    if (remaining > 0) {
      this.phaseTimer = setTimeout(() => {
        this.endPhase(this.session!.phase);
      }, remaining);
    }
  }
  
  private clearPhaseTimer(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }
  
  // ============================================================================
  // Manual Phase Control
  // ============================================================================
  
  skipCurrentPhase(): boolean {
    if (!this.session || !this.isRunning || this.isPaused) {
      return false;
    }
    
    const currentPhase = this.session.phase;
    this.endPhase(currentPhase);
    
    debug.info('Phase skipped: %s', currentPhase);
    return true;
  }
  
  extendCurrentPhase(extendDurationMs: number): boolean {
    if (!this.session || !this.isRunning || this.isPaused || !this.phaseTimer) {
      return false;
    }
    
    // Clear current timer
    clearTimeout(this.phaseTimer);
    
    // Start new timer with extended duration
    const currentPhase = this.session.phase;
    const baseDuration = this.getPhaseDuration(currentPhase);
    const elapsed = this.phaseStartTime ? Date.now() - this.phaseStartTime : 0;
    const newDuration = baseDuration + extendDurationMs;
    const remaining = Math.max(0, newDuration - elapsed);
    
    this.phaseTimer = setTimeout(() => {
      this.endPhase(currentPhase);
    }, remaining);
    
    debug.info('Phase extended: %s by %dms', currentPhase, extendDurationMs);
    return true;
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  update(timestamp: number): void {
    if (!this.isRunning || this.isPaused || !this.session) {
      return;
    }
    
    // Periodic checks if needed
    // Could add phase-specific logic here
  }
  
  getCurrentPhase(): SessionPhase {
    return this.session?.phase || 'PREPARATION';
  }
  
  getPhaseTimeRemaining(): number {
    if (!this.session || !this.phaseStartTime || !this.phaseTimer) {
      return 0;
    }
    
    const totalDuration = this.getPhaseDuration(this.session.phase);
    const elapsed = Date.now() - this.phaseStartTime;
    return Math.max(0, totalDuration - elapsed);
  }
  
  getPhaseProgress(): number {
    if (!this.session || !this.phaseStartTime) {
      return 0;
    }
    
    const totalDuration = this.getPhaseDuration(this.session.phase);
    const elapsed = Date.now() - this.phaseStartTime;
    return Math.min(100, (elapsed / totalDuration) * 100);
  }
  
  getPhaseStats(): {
    currentPhase: SessionPhase;
    timeRemaining: number;
    progress: number;
    currentInterval: number;
    totalIntervals: number;
    intervalsCompleted: number;
  } {
    if (!this.session) {
      return {
        currentPhase: 'PREPARATION',
        timeRemaining: 0,
        progress: 0,
        currentInterval: 0,
        totalIntervals: 0,
        intervalsCompleted: 0,
      };
    }
    
    return {
      currentPhase: this.session.phase,
      timeRemaining: this.getPhaseTimeRemaining(),
      progress: this.getPhaseProgress(),
      currentInterval: this.session.currentInterval,
      totalIntervals: this.session.totalIntervals,
      intervalsCompleted: this.session.intervalsCompleted,
    };
  }
}
