/**
 * SpectacleService
 *
 * Centralized celebration orchestrator for the VEX app.
 * Manages all spectacle events, animations, haptics, and queueing.
 *
 * Integration dependencies:
 * - Session completion flow (SessionOrchestrator)
 * - Boss defeat handler (BossService)
 * - Streak milestone handler (StreakService)
 * - Level progression (ProgressionService)
 * - Rewards system (RewardService)
 */

import * as Sentry from '@sentry/react-native';
import { generateUUID } from '../../session/utils/idGenerator';
import { triggerHaptic, triggerHapticPattern, type HapticFeedbackKind } from '../../utils/haptics';
import {
  SpectacleType,
  SpectacleState,
  SpectacleEvent,
  SpectacleQueueEntry,
  SpectacleListener,
  SpectaclePayloadMap,
  TriggerSpectacleOptions,
  HapticPattern,
  AnimationIntensity,
  AnimationConfig,
  LootRarity,
} from './types';
import { SpectacleEventSchema } from './schemas';

/**
 * Default animation configurations by spectacle type
 */
const DEFAULT_ANIMATION_CONFIGS: Record<SpectacleType, AnimationConfig> = {
  [SpectacleType.BOSS_DEFEATED]: {
    intensity: AnimationIntensity.EPIC,
    duration: 6000,
    delay: 0,
    staggerDelay: 200,
  },
  [SpectacleType.STREAK_MILESTONE]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 4000,
    delay: 0,
    staggerDelay: 150,
  },
  [SpectacleType.LEVEL_UP]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 3500,
    delay: 0,
    staggerDelay: 100,
  },
  [SpectacleType.RARE_LOOT_DROP]: {
    intensity: AnimationIntensity.NORMAL,
    duration: 2500,
    delay: 0,
    staggerDelay: 100,
  },
  [SpectacleType.LEGENDARY_LOOT_DROP]: {
    intensity: AnimationIntensity.EPIC,
    duration: 5000,
    delay: 800,
    staggerDelay: 200,
  },
  [SpectacleType.PERFECT_SESSION]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 3000,
    delay: 0,
    staggerDelay: 100,
  },
  [SpectacleType.FIRST_SESSION]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 4500,
    delay: 0,
    staggerDelay: 150,
  },
  [SpectacleType.PRESTIGE]: {
    intensity: AnimationIntensity.EPIC,
    duration: 5000,
    delay: 0,
    staggerDelay: 200,
  },
  [SpectacleType.SQUAD_WAR_WON]: {
    intensity: AnimationIntensity.EPIC,
    duration: 6000,
    delay: 0,
    staggerDelay: 200,
  },
  [SpectacleType.RIVAL_BEATEN]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 3500,
    delay: 0,
    staggerDelay: 150,
  },
  [SpectacleType.SEASON_COMPLETED]: {
    intensity: AnimationIntensity.EPIC,
    duration: 5500,
    delay: 0,
    staggerDelay: 200,
  },
  [SpectacleType.MASTERY_RANK_UP]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 3500,
    delay: 0,
    staggerDelay: 150,
  },
  [SpectacleType.COMPANION_EVOLVED]: {
    intensity: AnimationIntensity.EPIC,
    duration: 5000,
    delay: 0,
    staggerDelay: 200,
  },
  [SpectacleType.MONTHLY_REPORT]: {
    intensity: AnimationIntensity.DRAMATIC,
    duration: 5000,
    delay: 0,
    staggerDelay: 150,
  },
  [SpectacleType.WAGER_WON]: {
    intensity: AnimationIntensity.EPIC,
    duration: 4000,
    delay: 0,
    staggerDelay: 150,
  },
};

/**
 * Default haptic patterns by spectacle type
 */
const DEFAULT_HAPTIC_PATTERNS: Record<SpectacleType, HapticPattern> = {
  [SpectacleType.BOSS_DEFEATED]: HapticPattern.HEAVY_THEN_SUCCESS,
  [SpectacleType.STREAK_MILESTONE]: HapticPattern.CELEBRATION,
  [SpectacleType.LEVEL_UP]: HapticPattern.SUCCESS,
  [SpectacleType.RARE_LOOT_DROP]: HapticPattern.MEDIUM,
  [SpectacleType.LEGENDARY_LOOT_DROP]: HapticPattern.LEGENDARY,
  [SpectacleType.PERFECT_SESSION]: HapticPattern.CELEBRATION,
  [SpectacleType.FIRST_SESSION]: HapticPattern.CELEBRATION,
  [SpectacleType.PRESTIGE]: HapticPattern.LEGENDARY,
  [SpectacleType.SQUAD_WAR_WON]: HapticPattern.HEAVY_THEN_SUCCESS,
  [SpectacleType.RIVAL_BEATEN]: HapticPattern.SUCCESS,
  [SpectacleType.SEASON_COMPLETED]: HapticPattern.LEGENDARY,
  [SpectacleType.MASTERY_RANK_UP]: HapticPattern.SUCCESS,
  [SpectacleType.COMPANION_EVOLVED]: HapticPattern.LEGENDARY,
  [SpectacleType.MONTHLY_REPORT]: HapticPattern.CELEBRATION,
  [SpectacleType.WAGER_WON]: HapticPattern.CELEBRATION,
};

/**
 * Default auto-dismiss delays by spectacle type (null = manual dismiss)
 */
const DEFAULT_DISMISS_DELAYS: Partial<Record<SpectacleType, number>> = {
  [SpectacleType.SQUAD_WAR_WON]: 6000,
  [SpectacleType.BOSS_DEFEATED]: 6000,
};

class SpectacleService {
  private state: SpectacleState = {
    currentEvent: null,
    queue: [],
    isPlaying: false,
    lastPlayedAt: null,
  };

  private listeners: Set<SpectacleListener> = new Set();
  private hapticEnabled = true;
  private processingQueue = false;

  /**
   * Enable or disable haptic feedback
   */
  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
  }

  /**
   * Get current spectacle state
   */
  getState(): SpectacleState {
    return { ...this.state };
  }

  /**
   * Check if a spectacle is currently playing
   */
  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Subscribe to spectacle events
   */
  subscribe(listener: SpectacleListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Trigger a spectacle event
   */
  triggerSpectacle<T extends SpectacleType>(
    type: T,
    payload: SpectaclePayloadMap[T],
    options: TriggerSpectacleOptions = {}
  ): void {
    try {
      // Validate payload
      const validationResult = this.validatePayload(type, payload);
      if (!validationResult.valid) {
        Sentry.captureMessage('Invalid spectacle payload', {
          level: 'warning',
          tags: { spectacleType: type },
          extra: { errors: validationResult.errors },
        });
        return;
      }

      // Build spectacle event
      const event: SpectacleEvent = {
        type,
        payload,
        animation: this.buildAnimationConfig(type, options),
        haptic: DEFAULT_HAPTIC_PATTERNS[type],
        autoDismiss: type in DEFAULT_DISMISS_DELAYS,
        dismissDelay: DEFAULT_DISMISS_DELAYS[type],
      };

      // Add to queue with priority
      const queueEntry: SpectacleQueueEntry = {
        id: generateUUID(),
        event,
        options,
        timestamp: Date.now(),
      };

      this.addToQueue(queueEntry);

      // Process queue if not already processing
      if (!this.processingQueue) {
        this.processQueue();
      }

      Sentry.addBreadcrumb({
        category: 'spectacle',
        message: `Spectacle triggered: ${type}`,
        level: 'info',
        data: { spectacleId: queueEntry.id },
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'spectacle', operation: 'trigger' },
        extra: { spectacleType: type },
      });
    }
  }

  /**
   * Skip current spectacle and move to next in queue
   */
  skipCurrent(): void {
    if (this.state.currentEvent) {
      this.state = {
        ...this.state,
        currentEvent: null,
        isPlaying: false,
      };
      this.notifyListeners();
      this.processQueue();
    }
  }

  /**
   * Clear all queued spectacles
   */
  clearQueue(): void {
    this.state = {
      ...this.state,
      queue: [],
    };
  }

  /**
   * Mark current spectacle as complete
   */
  completeCurrent(): void {
    if (this.state.currentEvent) {
      this.state = {
        currentEvent: null,
        queue: this.state.queue,
        isPlaying: false,
        lastPlayedAt: Date.now(),
      };
      this.notifyListeners();
      this.processQueue();
    }
  }

  /**
   * Trigger haptic pattern for a spectacle type
   */
  async playHaptic(pattern: HapticPattern): Promise<void> {
    if (!this.hapticEnabled) {return;}

    try {
      const toKind = (kind: HapticPattern): HapticFeedbackKind => {
        switch (kind) {
          case HapticPattern.LIGHT:
            return 'impactLight';
          case HapticPattern.MEDIUM:
            return 'impactMedium';
          case HapticPattern.HEAVY:
            return 'impactHeavy';
          case HapticPattern.ERROR:
            return 'error';
          default:
            return 'success';
        }
      };

      switch (pattern) {
        case HapticPattern.LIGHT:
        case HapticPattern.MEDIUM:
        case HapticPattern.HEAVY:
        case HapticPattern.SUCCESS:
        case HapticPattern.ERROR:
          await triggerHaptic(toKind(pattern));
          break;
        case HapticPattern.HEAVY_THEN_SUCCESS:
          await triggerHapticPattern(['impactHeavy', 'success', 'impactMedium', 'impactMedium', 'impactMedium']);
          break;
        case HapticPattern.CELEBRATION:
          await triggerHapticPattern(['success', 'impactMedium', 'impactLight', 'success']);
          break;
        case HapticPattern.LEGENDARY:
          await triggerHapticPattern(['impactHeavy', 'impactHeavy', 'success', 'impactMedium', 'impactHeavy']);
          break;
      }
    } catch (error) {
      // Haptics are non-critical, just log
      Sentry.addBreadcrumb({
        category: 'spectacle',
        message: 'Haptic playback failed',
        level: 'warning',
      });
    }
  }

  /**
   * Determine spectacle type from loot rarity
   */
  getLootSpectacleType(rarity: LootRarity): SpectacleType {
    if (rarity === LootRarity.LEGENDARY) {
      return SpectacleType.LEGENDARY_LOOT_DROP;
    }
    return SpectacleType.RARE_LOOT_DROP;
  }

  private validatePayload(
    type: SpectacleType,
    payload: unknown
  ): { valid: boolean; errors?: string[] } {
    try {
      // Build a partial event for validation
      const partialEvent = { type, payload };
      SpectacleEventSchema.parse(partialEvent);
      return { valid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { valid: false, errors: [error.message] };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  private buildAnimationConfig(
    type: SpectacleType,
    options: TriggerSpectacleOptions
  ): AnimationConfig {
    const defaultConfig = DEFAULT_ANIMATION_CONFIGS[type];
    return {
      ...defaultConfig,
      duration: options.customDuration ?? defaultConfig.duration,
    };
  }

  private addToQueue(entry: SpectacleQueueEntry): void {
    const priority = this.getPriorityValue(entry.options.priority);

    // Insert based on priority (higher priority first)
    const insertIndex = this.state.queue.findIndex(
      e => this.getPriorityValue(e.options.priority) < priority
    );

    if (insertIndex === -1) {
      this.state.queue.push(entry);
    } else {
      this.state.queue.splice(insertIndex, 0, entry);
    }
  }

  private getPriorityValue(priority?: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.state.isPlaying || this.state.queue.length === 0) {
      return;
    }

    this.processingQueue = true;

    const entry = this.state.queue.shift();
    if (!entry) {
      this.processingQueue = false;
      return;
    }

    // Set current event
    this.state = {
      ...this.state,
      currentEvent: entry.event,
      isPlaying: true,
    };

    // Notify listeners
    this.notifyListeners();

    // Play haptic if not skipped
    if (!entry.options.skipHaptic) {
      await this.playHaptic(entry.event.haptic);
    }

    // Auto-dismiss if configured
    if (entry.event.autoDismiss && entry.event.dismissDelay) {
      setTimeout(() => {
        this.completeCurrent();
      }, entry.event.dismissDelay);
    }

    this.processingQueue = false;
  }

  private notifyListeners(): void {
    const event = this.state.currentEvent;
    if (event) {
      this.listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          Sentry.captureException(error, {
            tags: { feature: 'spectacle', operation: 'notify' },
          });
        }
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const spectacleService = new SpectacleService();

// Export class for testing
export { SpectacleService };
