/**
 * GlassHaptics — semantic haptic mapping for the VEX native glass system.
 *
 * Every glass interaction routes through this module instead of calling
 * raw haptics directly. The underlying HapticEngine handles cooldown (50ms),
 * battery gating, and system-preference checks.
 */
import { haptics } from './HapticEngine';

export const glassHaptics = {
  /** Tab bar item pressed — light selection feedback. */
  tabPress: () => haptics.selection(),

  /** Pill / segmented-control selection changed. */
  selectedPill: () => haptics.selection(),

  /** Hero surface or identity card pressed — medium impact. */
  heroPress: () => haptics.impact('medium'),

  /** Bottom sheet snap/settle — light impact. */
  sheetSnap: () => haptics.impact('light'),

  /** Primary CTA or action button pressed — medium impact. */
  primaryAction: () => haptics.impact('medium'),

  /** Task, session, or streak completed — success feedback. */
  completion: () => haptics.success('medium'),

  /** Attempted action on a disabled element — warning pulse. */
  disabled: () => haptics.warning('light'),
};
