/**
 * Premium Haptic Feedback Engine
 *
 * Context-aware haptic responses that make the app feel alive.
 * Uses Expo Haptics for iOS/Android vibration patterns.
 *
 * Features:
 * - Context-aware feedback (success, error, warning, neutral)
 * - Intensity levels (light, medium, heavy)
 * - Custom patterns for special moments
 * - Automatic disabled when low battery or user preference
 */


const Haptics = require('expo-haptics');
import { createDebugger } from '@/utils/debug';
import { Platform } from 'react-native';

const debug = createDebugger('feedback:haptics');

// ============================================================================
// Types & Configuration
// ============================================================================

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticContext = 'success' | 'error' | 'warning' | 'neutral' | 'selection' | 'impact';

interface HapticConfig {
  enabled: boolean;
  respectBattery: boolean;
  respectSystemPreference: boolean;
  intensity: HapticIntensity;
}

interface HapticPattern {
  type: 'notification' | 'impact' | 'custom';
  style?: string;
  delays?: number[];
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: HapticConfig = {
  enabled: true,
  respectBattery: true,
  respectSystemPreference: true,
  intensity: 'medium',
};

// Pattern definitions for each context
const PATTERNS: Record<HapticContext, HapticPattern> = {
  success: {
    type: 'notification',
    style: Haptics?.NotificationFeedbackType?.Success ?? 'success',
  },
  error: {
    type: 'notification',
    style: Haptics?.NotificationFeedbackType?.Error ?? 'error',
  },
  warning: {
    type: 'notification',
    style: Haptics?.NotificationFeedbackType?.Warning ?? 'warning',
  },
  neutral: {
    type: 'impact',
    style: Haptics?.ImpactFeedbackStyle?.Light ?? 'light',
  },
  selection: {
    type: 'impact',
    style: Haptics?.ImpactFeedbackStyle?.Light ?? 'light',
  },
  impact: {
    type: 'impact',
    style: Haptics?.ImpactFeedbackStyle?.Medium ?? 'medium',
  },
};

// ============================================================================
// Haptic Engine Class
// ============================================================================

class HapticEngine {
  private config: HapticConfig = DEFAULT_CONFIG;
  private batteryLevel: number = 1.0;
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 50; // Prevent spam

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    // Could load from MMKV or MMKV
    // For now, use defaults
  }

  /**
   * Update battery level for smart haptics
   */
  setBatteryLevel(level: number): void {
    this.batteryLevel = Math.max(0, Math.min(1, level));
  }

  /**
   * Check if haptics should be enabled
   */
  private shouldTrigger(): boolean {
    if (!this.config.enabled) { return false; }
    if (Platform.OS === 'web') { return false; }

    // Respect battery - disable below 10%
    if (this.config.respectBattery && this.batteryLevel < 0.1) {
      return false;
    }

    // Cooldown to prevent spam
    const now = Date.now();
    if (now - this.lastTriggerTime < this.cooldownMs) {
      return false;
    }

    return true;
  }

  /**
   * Trigger haptic feedback with context
   */
  async trigger(context: HapticContext, intensity?: HapticIntensity): Promise<void> {
    if (!this.shouldTrigger()) {return;}

    const pattern = PATTERNS[context];
    const targetIntensity = intensity || this.config.intensity;

    try {
      this.lastTriggerTime = Date.now();

      switch (pattern.type) {
        case 'notification':
          await Haptics?.notificationAsync?.(pattern.style);
          break;

        case 'impact':
          const style = this.getImpactStyle(targetIntensity);
          await Haptics?.impactAsync?.(style);
          break;
      }

      debug.info('Haptic triggered: %s (%s)', context, targetIntensity);
    } catch (error) {
      debug.warn('Haptic failed: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get impact style based on intensity
   */
  private getImpactStyle(intensity: HapticIntensity): string {
    const styles = Haptics?.ImpactFeedbackStyle;
    switch (intensity) {
      case 'light':
        return styles?.Light ?? 'light';
      case 'heavy':
        return styles?.Heavy ?? 'heavy';
      case 'medium':
      default:
        return styles?.Medium ?? 'medium';
    }
  }

  /**
   * Success feedback - for completions, achievements
   */
  async success(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('success', intensity);
  }

  /**
   * Error feedback - for failures, cancellations
   */
  async error(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('error', intensity);
  }

  /**
   * Warning feedback - for alerts, confirmations needed
   */
  async warning(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('warning', intensity);
  }

  /**
   * Selection feedback - for taps, selections
   */
  async selection(): Promise<void> {
    await this.trigger('selection', 'light');
  }

  /**
   * Impact feedback - for presses, gestures
   */
  async impact(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('impact', intensity);
  }

  /**
   * Double tap pattern - for special moments
   */
  async doubleTap(intensity: HapticIntensity = 'light'): Promise<void> {
    if (!this.shouldTrigger()) { return; }

    const style = this.getImpactStyle(intensity);

    try {
      await Haptics.impactAsync(style);
      setTimeout(async () => {
        await Haptics.impactAsync(style);
      }, 80);

      debug.info('Haptic double-tap triggered');
    } catch (error) {
      debug.warn('Double-tap haptic failed: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Heartbeat pattern - for urgent notifications
   */
  async heartbeat(): Promise<void> {
    if (!this.shouldTrigger()) { return; }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 150);

      debug.info('Haptic heartbeat triggered');
    } catch (error) {
      debug.warn('Heartbeat haptic failed: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Celebration pattern - for major achievements
   */
  async celebration(): Promise<void> {
    if (!this.shouldTrigger()) { return; }

    try {
      // Success + double tap pattern
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 100);

      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 200);

      debug.info('Haptic celebration triggered');
    } catch (error) {
      debug.warn('Celebration haptic failed: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('Haptic config updated: %o', this.config);
  }

  /**
   * Enable/disable haptics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    debug.info('Haptics %s', enabled ? 'enabled' : 'disabled');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let hapticEngine: HapticEngine | null = null;

export function getHapticEngine(): HapticEngine {
  if (!hapticEngine) {
    hapticEngine = new HapticEngine();
  }
  return hapticEngine;
}

// Convenience exports for direct use
export const haptics = {
  success: (intensity?: HapticIntensity) => getHapticEngine().success(intensity),
  error: (intensity?: HapticIntensity) => getHapticEngine().error(intensity),
  warning: (intensity?: HapticIntensity) => getHapticEngine().warning(intensity),
  selection: () => getHapticEngine().selection(),
  impact: (intensity?: HapticIntensity) => getHapticEngine().impact(intensity),
  doubleTap: (intensity?: HapticIntensity) => getHapticEngine().doubleTap(intensity),
  heartbeat: () => getHapticEngine().heartbeat(),
  celebration: () => getHapticEngine().celebration(),
  trigger: (context: HapticContext, intensity?: HapticIntensity) =>
    getHapticEngine().trigger(context, intensity),
  setEnabled: (enabled: boolean) => getHapticEngine().setEnabled(enabled),
  setBatteryLevel: (level: number) => getHapticEngine().setBatteryLevel(level),
};

export default HapticEngine;

