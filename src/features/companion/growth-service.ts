import { CompanionState } from './types';
import { emitCompanionStateChanged } from './events';
import { trackCompanionGrowth } from './analytics';
import { CompanionGrowthServiceCore } from './growth-service-core';

export class CompanionGrowthService extends CompanionGrowthServiceCore {
  reactToStreakMaintained(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    this.state.currentMood = 'ECSTATIC';
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 20);
    this.state.level = Math.min(100, this.state.level + 2);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      'streak_maintained',
    );
    trackCompanionGrowth(
      userId,
      'streak_maintained',
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  reactToComebackCompleted(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    this.state.currentMood = 'DETERMINED';
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 30);
    this.state.level = Math.min(100, this.state.level + 5);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      'comeback_completed',
    );
    trackCompanionGrowth(
      userId,
      'comeback_completed',
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  reactToFocusScoreChanged(
    userId: string,
    previousScore: number,
    newScore: number,
  ): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    if (newScore > previousScore) {
      this.state.currentMood = newScore > 700 ? 'ECSTATIC' : 'FOCUSED';
      this.state.energyLevel = Math.min(100, this.state.energyLevel + 15);
    } else if (newScore < previousScore - 50) {
      this.state.currentMood = 'CONTENT';
      this.state.energyLevel = Math.max(0, this.state.energyLevel - 10);
    }

    if (newScore > previousScore) {
      this.state.level = Math.min(100, this.state.level + 1);
    }

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      'focus_score_changed',
    );
    trackCompanionGrowth(
      userId,
      'focus_score_changed',
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }

  reactToDailyMissionCompleted(userId: string): void {
    if (!this.state) {
      return;
    }

    const previousState = { ...this.state };

    this.state.currentMood = 'CONTENT';
    this.state.energyLevel = Math.min(100, this.state.energyLevel + 10);
    this.state.level = Math.min(100, this.state.level + 1);

    emitCompanionStateChanged(
      userId,
      this.state.id,
      previousState,
      this.state,
      'daily_mission_completed',
    );
    trackCompanionGrowth(
      userId,
      'daily_mission_completed',
      previousState.phase,
      this.state.phase,
      previousState.currentMood,
      this.state.currentMood,
      this.state.level,
    );
  }
}
