/**
 * Feedback System Exports
 *
 * Premium haptic and audio feedback for exceptional user experience.
 */

export { getHapticEngine, haptics } from "./HapticEngine";
export type { HapticContext, HapticIntensity } from "./HapticEngine";

// HapticEngine class is exported as default from the module
import HapticEngineClass from "./HapticEngine";
export { HapticEngineClass as HapticEngine };
