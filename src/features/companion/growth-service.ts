/**
 * Companion Growth Service
 *
 * Handles companion growth reactions to key events.
 * Split from main service to maintain file size limits.
 */

import { CompanionState, CompanionMood, CompanionPhase } from "./types";
import { emitCompanionStateChanged, emitCompanionEvolution } from "./events";
import { trackCompanionGrowth, trackCompanionEvolution } from "./analytics";
import { checkMilestones } from "./milestone-tracker";

/**
 * Companion Growth Service
 *
 * Handles growth reactions and milestone tracking.
 */
export class CompanionGrowthService {
  private state: CompanionState | null = null;

  constructor(state?: CompanionState) {
    if (state) {
      this.state = { ...state };
    }
  }

  /**
   * Update the internal state
   */
  updateState(state: CompanionState): void {
    this.state = { ...state };
  }

  /**
   * React to session completion
   */
  processSessionCompletion(
    sessionMinutes: number,
    finalPurity: number,
    userId?: string,
    sessionId?: string,
  ): { leveledUp: boolean; evolved: boolean; newPhase?: CompanionPhase } {
    if (!this.state) {
      return { leveledUp: false, evolved: false };
    }

    const previousState = { ...this.state };
    const previousLevel = this.state.level;
    const previousSessionCount = this.state.sessionCount;
    const previousFocusMinutes = this.state.totalFocusMinutes;
    const previousPerfectSessions = this.state.perfectSessions;

    this.state.totalFocusMinutes += sessionMinutes;
    this.state.sessionCount += 1;
    if (finalPurity > 90) {
      this.state.perfectSessions += 1;
    }

    const currentThreshold = this.getEvolutionThreshold(this.state.phase);
    const phases: CompanionPhase[] = [
      "EGG",
      "HATCHING",
      "YOUNG",
      "MATURE",
      "AWAKENED",
      "TRANSCENDENT",
    ];
    const minutesInPhase =
      this.state.totalFocusMinutes -
      phases
        .slice(0, phases.indexOf(this.state.phase))
        .reduce((sum, phase) => sum + this.getEvolutionThreshold(phase), 0);

    let evolved = false;
    let newPhase: CompanionPhase | undefined;

    if (
      minutesInPhase >= currentThreshold &&
      this.state.phase !== "TRANSCENDENT"
    ) {
      const previousPhase = this.state.phase;
      this.state.phase = phases[phases.indexOf(this.state.phase) + 1]!;
      this.state.level = 1;
      evolved = true;
      newPhase = this.state.phase;

      // Emit evolution event
      if (userId) {
        emitCompanionEvolution(
          userId,
          this.state.id,
          previousPhase,
          newPhase,
          this.state.totalFocusMinutes,
          true,
        );
        trackCompanionEvolution(
          userId,
          previousPhase,
          newPhase,
          this.state.totalFocusMinutes,
          true,
        );
      }
    } else {
      this.state.level = Math.max(
        1,
        Math.floor((minutesInPhase / currentThreshold) * 100),
      );
    }

    // Emit state change event for session completion
    if (userId) {
      emitCompanionStateChanged(
        userId,
        this.state.id,
        previousState,
        this.state,
        "session_completed",
        sessionId,
      );
      trackCompanionGrowth(
        userId,
        "session_completed",
        previousState.phase,
        this.state.phase,
        previousState.currentMood,
        this.state.currentMood,
        this.state.level,
        sessionId,
      );

      // Check for milestones
      checkMilestones(
        this.state,
        userId,
        previousLevel,
        previousSessionCount,
        previousFocusMinutes,
        previousPerfectSessions,
      );
    }

    const leveledUp = this.state.level > previousLevel || evolved;
    return { leveledUp, evolved, newPhase };
  }

  /**
   * React to streak maintained event
   */
  reactToStreakMaintained(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    // Boost companion mood and energy for streak maintenance
    this.state.currentMood = "ECSTATIC";
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 20);

    // Small growth bonus for streak consistency
    this.state.level = Math.min(100, this.state.level + 2);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      "streak_maintained",
    );
    trackCompanionGrowth(
      userId,
      "streak_maintained",
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  /**
   * React to comeback completed event
   */
  reactToComebackCompleted(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    // Significant mood boost for comeback
    this.state.currentMood = "DETERMINED";
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 30);

    // Growth bonus for comeback resilience
    this.state.level = Math.min(100, this.state.level + 5);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      "comeback_completed",
    );
    trackCompanionGrowth(
      userId,
      "comeback_completed",
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  /**
   * React to Focus Score band change
   */
  reactToFocusScoreChanged(
    userId: string,
    previousScore: number,
    newScore: number,
  ): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    // Determine mood based on score change
    if (newScore > previousScore) {
      this.state.currentMood = newScore > 700 ? "ECSTATIC" : "FOCUSED";
      this.state.energyLevel = Math.min(100, this.state.energyLevel + 15);
    } else if (newScore < previousScore - 50) {
      this.state.currentMood = "CONTENT";
      this.state.energyLevel = Math.max(0, this.state.energyLevel - 10);
    }

    // Small growth for score improvements
    if (newScore > previousScore) {
      this.state.level = Math.min(100, this.state.level + 1);
    }

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      "focus_score_changed",
    );
    trackCompanionGrowth(
      userId,
      "focus_score_changed",
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  /**
   * React to daily mission completed
   */
  reactToDailyMissionCompleted(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    // Positive mood reaction to mission completion
    this.state.currentMood = "CONTENT";
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 10);

    // Small growth for mission consistency
    this.state.level = Math.min(100, this.state.level + 1);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      "daily_mission_completed",
    );
    trackCompanionGrowth(
      userId,
      "daily_mission_completed",
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  /**
   * Get current state
   */
  getState(): CompanionState | null {
    return this.state ? { ...this.state } : null;
  }

  /**
   * Get evolution threshold for phase
   */
  private getEvolutionThreshold(phase: CompanionPhase): number {
    const thresholds = {
      EGG: 0,
      HATCHING: 60,
      YOUNG: 300,
      MATURE: 1000,
      AWAKENED: 5000,
      TRANSCENDENT: Infinity,
    };
    return thresholds[phase];
  }
}
