import { CompanionState, CompanionPhase } from './types';
import { emitCompanionStateChanged, emitCompanionEvolution } from './events';
import { trackCompanionGrowth, trackCompanionEvolution } from './analytics';
import { checkMilestones } from './milestone-tracker';

export class CompanionGrowthServiceCore {
  protected state: CompanionState | null = null;

  constructor(state?: CompanionState) {
    if (state) {
      this.state = { ...state };
    }
  }

  updateState(state: CompanionState): void {
    this.state = { ...state };
  }

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
      'EGG',
      'HATCHING',
      'YOUNG',
      'MATURE',
      'AWAKENED',
      'TRANSCENDENT',
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
      this.state.phase !== 'TRANSCENDENT'
    ) {
      const previousPhase = this.state.phase;
      this.state.phase = phases[phases.indexOf(this.state.phase) + 1]!;
      this.state.level = 1;
      evolved = true;
      newPhase = this.state.phase;

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

    if (userId) {
      emitCompanionStateChanged(
        userId,
        this.state.id,
        previousState,
        this.state,
        'session_completed',
        sessionId,
      );
      trackCompanionGrowth(
        userId,
        'session_completed',
        previousState.phase,
        this.state.phase,
        previousState.currentMood,
        this.state.currentMood,
        this.state.level,
        sessionId,
      );

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

  getState(): CompanionState | null {
    return this.state ? { ...this.state } : null;
  }

  protected getEvolutionThreshold(phase: CompanionPhase): number {
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
