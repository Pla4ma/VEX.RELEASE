import { CompanionMood, CompanionPhase, CompanionSessionEvent, CompanionState } from "./types";
import { CompanionGrowthService } from "./growth-service";
import { getDefaultStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { getEconomyService } from "../../economy/EconomyService";
import { z } from "zod";


export class CompanionService {
  private state: CompanionState | null = null;
  private eventListeners: Array<(event: CompanionSessionEvent) => void> = [];
  private lastMilestone = 0;
  private currentStreakSeconds = 0;
  private growthService: CompanionGrowthService;

  constructor(initialState?: CompanionState) {
    if (initialState) {
      this.state = { ...initialState };
    }
    this.growthService = new CompanionGrowthService(this.state || undefined);
  }

  startSession(_sessionDurationMinutes?: number): void {
    if (!this.state) {
      return;
    }
    this.state.currentMood = 'SLEEPY';
    this.state.sessionProgress = 0;
    this.state.energyLevel = 50;
    this.lastMilestone = 0;
    this.currentStreakSeconds = 0;
    this.emitEvent({
      type: 'MOOD_SHIFT',
      timestamp: Date.now(),
      data: { mood: 'SLEEPY', message: 'Your companion awakens...' },
    });
  }

  tick(elapsedSeconds: number, totalDurationSeconds: number, purityScore: number, isPaused: boolean): void {
    if (!this.state) {return;}
    const progress = (elapsedSeconds / totalDurationSeconds) * 100;
    this.state.sessionProgress = progress;
    this.state.purityScore = purityScore;
    if (!isPaused) {
      this.state.energyLevel = Math.max(0, Math.min(100, this.state.energyLevel + (purityScore > 80 ? 0.2 : purityScore > 50 ? 0.1 : -0.3)));
      this.currentStreakSeconds = purityScore > 80 ? this.currentStreakSeconds + 1 : 0;
    }
    const nextMood = this.calculateMood(progress, this.state.energyLevel, purityScore);
    if (nextMood !== this.state.currentMood) {
      this.state.currentMood = nextMood;
      this.emitEvent({
        type: 'MOOD_SHIFT',
        timestamp: Date.now(),
        data: { mood: nextMood, message: this.getMoodMessage(nextMood) },
      });
    }
    const milestone = Math.floor(progress / 10) * 10;
    if (milestone > this.lastMilestone && milestone > 0) {
      this.lastMilestone = milestone;
      this.emitEvent({
        type: 'MILESTONE',
        timestamp: Date.now(),
        data: { progressDelta: milestone, message: `${milestone}% - Your companion grows stronger!` },
      });
    }
  }

  completeSession(sessionMinutes: number, finalPurity: number, userId?: string, sessionId?: string): { leveledUp: boolean; evolved: boolean; newPhase?: CompanionPhase } {
    if (!this.state) {return { leveledUp: false, evolved: false };}
    this.growthService.updateState(this.state);
    const result = this.growthService.processSessionCompletion(sessionMinutes, finalPurity, userId, sessionId);
    const updatedState = this.growthService.getState();
    if (updatedState) {this.state = updatedState;}
    return result;
  }

  getState(): CompanionState | null {
    return this.state ? { ...this.state } : null;
  }

  onEvent(callback: (event: CompanionSessionEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((listener) => listener !== callback);
    };
  }

  reactToStreakMaintained(userId: string): void {
    if (!this.state) {return;}
    this.growthService.updateState(this.state);
    this.growthService.reactToStreakMaintained(userId);
    const updatedState = this.growthService.getState();
    if (updatedState) {
      this.state = updatedState;
    }
    this.emitEvent({
      type: 'MILESTONE',
      timestamp: Date.now(),
      data: {
        progressDelta: 100,
        message: 'Your companion celebrates your streak consistency!',
        intensity: 0.8,
      },
    });
  }

  reactToComebackCompleted(userId: string): void {
    if (!this.state) {return;}
    this.growthService.updateState(this.state);
    this.growthService.reactToComebackCompleted(userId);
    const updatedState = this.growthService.getState();
    if (updatedState) {
      this.state = updatedState;
    }
    this.emitEvent({
      type: 'MILESTONE',
      timestamp: Date.now(),
      data: {
        progressDelta: 100,
        message: 'Your companion admires your resilience!',
        intensity: 0.9,
      },
    });
  }

  reactToFocusScoreChanged(userId: string, previousScore: number, newScore: number): void {
    if (!this.state) {return;}
    this.growthService.updateState(this.state);
    this.growthService.reactToFocusScoreChanged(userId, previousScore, newScore);
    const updatedState = this.growthService.getState();
    if (updatedState) {
      this.state = updatedState;
    }
    this.emitEvent({
      type: newScore > previousScore ? 'GROWTH_PULSE' : 'MOOD_SHIFT',
      timestamp: Date.now(),
      data: {
        mood: this.state.currentMood,
        message: newScore > previousScore ? 'Your companion feels your focus growing!' : 'Your companion senses the challenge.',
        intensity: 0.6,
      },
    });
  }

  reactToDailyMissionCompleted(userId: string): void {
    if (!this.state) {return;}
    this.growthService.updateState(this.state);
    this.growthService.reactToDailyMissionCompleted(userId);
    const updatedState = this.growthService.getState();
    if (updatedState) {
      this.state = updatedState;
    }
    this.emitEvent({
      type: 'MILESTONE',
      timestamp: Date.now(),
      data: {
        progressDelta: 100,
        message: 'Your companion nods with approval at your daily progress!',
        intensity: 0.5,
      },
    });
  }

  private calculateMood(progress: number, energy: number, purity: number): CompanionMood {
    if (purity < 30 && energy < 20) {
      return 'DANGER';
    }
    if (energy < 30) {
      return 'STRUGGLING';
    }
    if (progress > 95 && energy > 80 && purity > 90) {
      return 'ECSTATIC';
    }
    if (progress > 70 && energy > 60) {
      return 'DETERMINED';
    }
    if (progress > 30 && energy > 50 && purity > 70) {
      return 'FOCUSED';
    }
    if (progress > 10 && energy > 30) {
      return 'CONTENT';
    }
    return 'SLEEPY';
  }

  private getMoodMessage(mood: CompanionMood): string {
    return {
      SLEEPY: 'Your companion stirs...',
      CONTENT: 'Your companion is at peace.',
      FOCUSED: 'Your companion focuses with you.',
      DETERMINED: 'Your companion pushes forward!',
      ECSTATIC: 'Your companion radiates pure energy!',
      STRUGGLING: 'Your companion needs your focus...',
      DANGER: 'Your companion is fading! Stay focused!',
    }[mood];
  }

  private emitEvent(event: CompanionSessionEvent): void {
    for (const callback of this.eventListeners) {
      callback(event);
    }
  }
}