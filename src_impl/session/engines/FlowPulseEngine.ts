/**
 * FlowPulseEngine
 *
 * Creates a rhythmic, haptic feedback loop that makes the act of focusing
 * feel tangible. Translates purity scores into a "flow state" that
 * accelerates when the user is locked in and gently nudges when they drift.
 *
 * Key mechanics:
 * - Calculates a trailing 30s purity window
 * - Maps purity trends to FlowState (DEEP_FLOW → FLOW → SHALLOW → DISTRACTED)
 * - Emits session:flow_pulse events for UI consumption
 * - Provides purityMomentum for accelerating rewards during deep focus
 */

import type { FlowState, FlowPulseEvent } from './micro-interaction-types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:flow-pulse');

const WINDOW_SECONDS = 30;
const DEEP_FLOW_THRESHOLD = 90;
const FLOW_THRESHOLD = 70;
const SHALLOW_THRESHOLD = 50;

export class FlowPulseEngine {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private purityHistory: Array<{ seconds: number; purity: number }> = [];
  private flowState: FlowState = 'SHALLOW';
  private sessionStartTime: number = 0;
  private onPulse: ((event: FlowPulseEvent) => void) | null = null;

  initialize(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.purityHistory = [];
    this.flowState = 'SHALLOW';
    debug.info('FlowPulseEngine initialized for session %s', sessionId);
  }

  onPulseEvent(callback: (event: FlowPulseEvent) => void): void {
    this.onPulse = callback;
  }

  tick(elapsedSeconds: number, purityScore: number, isPaused: boolean): FlowPulseEvent | null {
    if (!this.sessionId || !this.userId || isPaused) {
      return null;
    }

    // Maintain trailing window
    this.purityHistory.push({ seconds: elapsedSeconds, purity: purityScore });
    const cutoff = elapsedSeconds - WINDOW_SECONDS;
    while (this.purityHistory.length > 0 && this.purityHistory[0]!.seconds < cutoff) {
      this.purityHistory.shift();
    }

    const windowPurity = this.calculateWindowPurity();
    const momentum = this.calculatePurityMomentum();
    const newFlowState = this.determineFlowState(windowPurity, momentum);
    const pulseQuality = Math.min(1, windowPurity / 100 + Math.max(0, momentum) * 0.3);

    const event: FlowPulseEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      flowState: newFlowState,
      previousFlowState: this.flowState,
      pulseQuality,
      purityWindow: Math.round(windowPurity),
      purityMomentum: momentum,
      timestamp: Date.now(),
    };

    this.flowState = newFlowState;
    this.onPulse?.(event);
    return event;
  }

  getFlowState(): FlowState {
    return this.flowState;
  }

  getPurityMomentum(): number {
    return this.calculatePurityMomentum();
  }

  getPurityAccelerationBonus(): number {
    const momentum = this.calculatePurityMomentum();
    if (this.flowState === 'DEEP_FLOW' && momentum > 0.3) {
      return 0.5; // +0.5% purity per tick in deep flow
    }
    if (this.flowState === 'FLOW' && momentum > 0.1) {
      return 0.2;
    }
    return 0;
  }

  destroy(): void {
    this.purityHistory = [];
    this.sessionId = null;
    this.userId = null;
    this.onPulse = null;
  }

  private calculateWindowPurity(): number {
    if (this.purityHistory.length === 0) {return 100;}
    return this.purityHistory.reduce((sum, p) => sum + p.purity, 0) / this.purityHistory.length;
  }

  private calculatePurityMomentum(): number {
    if (this.purityHistory.length < 5) {return 0;}
    const recent = this.purityHistory.slice(-10);
    if (recent.length < 2) {return 0;}
    let trend = 0;
    for (let i = 1; i < recent.length; i++) {
      trend += recent[i]!.purity - recent[i! - 1]!.purity;
    }
    return Math.max(-1, Math.min(1, trend / (recent.length * 10)));
  }

  private determineFlowState(windowPurity: number, momentum: number): FlowState {
    if (windowPurity >= DEEP_FLOW_THRESHOLD && momentum >= -0.1) {return 'DEEP_FLOW';}
    if (windowPurity >= FLOW_THRESHOLD) {return 'FLOW';}
    if (windowPurity >= SHALLOW_THRESHOLD) {return 'SHALLOW';}
    return 'DISTRACTED';
  }
}
