import { Platform } from 'react-native';
import { createDebugger } from '@/utils/debug';
import {
  triggerHaptic,
  triggerHapticPattern,
  type HapticFeedbackKind,
} from '@/utils/haptics';

const debug = createDebugger('feedback:haptics');

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticContext =
  | 'success'
  | 'error'
  | 'warning'
  | 'neutral'
  | 'selection'
  | 'impact';

interface HapticConfig {
  enabled: boolean;
  respectBattery: boolean;
  respectSystemPreference: boolean;
  intensity: HapticIntensity;
}

const DEFAULT_CONFIG: HapticConfig = {
  enabled: true,
  respectBattery: true,
  respectSystemPreference: true,
  intensity: 'medium',
};

function toImpactKind(intensity: HapticIntensity): HapticFeedbackKind {
  if (intensity === 'light') {return 'impactLight';}
  if (intensity === 'heavy') {return 'impactHeavy';}
  return 'impactMedium';
}

class HapticEngine {
  private config: HapticConfig = DEFAULT_CONFIG;
  private batteryLevel = 1;
  private lastTriggerTime = 0;
  private readonly cooldownMs = 50;

  setBatteryLevel(level: number): void {
    this.batteryLevel = Math.max(0, Math.min(1, level));
  }

  private shouldTrigger(): boolean {
    if (!this.config.enabled || Platform.OS === 'web') {return false;}
    if (this.config.respectBattery && this.batteryLevel < 0.1) {return false;}
    return Date.now() - this.lastTriggerTime >= this.cooldownMs;
  }

  async trigger(
    context: HapticContext,
    intensity?: HapticIntensity,
  ): Promise<void> {
    if (!this.shouldTrigger()) {return;}
    const targetIntensity = intensity ?? this.config.intensity;
    const kind = this.toHapticKind(context, targetIntensity);

    try {
      this.lastTriggerTime = Date.now();
      await triggerHaptic(kind);
      debug.info('Haptic triggered: %s (%s)', context, targetIntensity);
    } catch (error) {
      debug.warn(
        'Haptic failed: %s',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private toHapticKind(
    context: HapticContext,
    intensity: HapticIntensity,
  ): HapticFeedbackKind {
    if (context === 'success') {return 'success';}
    if (context === 'error') {return 'error';}
    if (context === 'warning') {return 'warning';}
    if (context === 'selection' || context === 'neutral') {return 'selection';}
    return toImpactKind(intensity);
  }

  async success(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('success', intensity);
  }

  async error(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('error', intensity);
  }

  async warning(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('warning', intensity);
  }

  async selection(): Promise<void> {
    await this.trigger('selection', 'light');
  }

  async impact(intensity?: HapticIntensity): Promise<void> {
    await this.trigger('impact', intensity);
  }

  async doubleTap(intensity: HapticIntensity = 'light'): Promise<void> {
    if (!this.shouldTrigger()) {return;}
    await triggerHapticPattern(
      [toImpactKind(intensity), toImpactKind(intensity)],
      80,
    );
  }

  async heartbeat(): Promise<void> {
    if (!this.shouldTrigger()) {return;}
    await triggerHapticPattern(['impactLight', 'impactMedium'], 150);
  }

  async celebration(): Promise<void> {
    if (!this.shouldTrigger()) {return;}
    await triggerHapticPattern(['success', 'impactMedium', 'impactLight'], 100);
  }

  setConfig(config: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('Haptic config updated');
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    debug.info('Haptics %s', enabled ? 'enabled' : 'disabled');
  }
}

let hapticEngine: HapticEngine | null = null;

export function getHapticEngine(): HapticEngine {
  if (!hapticEngine) {
    hapticEngine = new HapticEngine();
  }
  return hapticEngine;
}

export const haptics = {
  success: (intensity?: HapticIntensity) =>
    getHapticEngine().success(intensity),
  error: (intensity?: HapticIntensity) => getHapticEngine().error(intensity),
  warning: (intensity?: HapticIntensity) =>
    getHapticEngine().warning(intensity),
  selection: () => getHapticEngine().selection(),
  impact: (intensity?: HapticIntensity) => getHapticEngine().impact(intensity),
  doubleTap: (intensity?: HapticIntensity) =>
    getHapticEngine().doubleTap(intensity),
  heartbeat: () => getHapticEngine().heartbeat(),
  celebration: () => getHapticEngine().celebration(),
  trigger: (context: HapticContext, intensity?: HapticIntensity) =>
    getHapticEngine().trigger(context, intensity),
  setEnabled: (enabled: boolean) => getHapticEngine().setEnabled(enabled),
  setBatteryLevel: (level: number) => getHapticEngine().setBatteryLevel(level),
};

export { HapticEngine }