/**
 * Accessibility System Barrel
 *
 * Re-exports the split implementation modules so callers can import from
 * a single location while each module stays under the 200 line limit.
 */

<<<<<<< HEAD
import { eventBus } from '../events';
import { AccessibilityPreferences } from './types';
import { DEFAULT_ACCESSIBILITY } from './constants';

export { DEFAULT_ACCESSIBILITY, COLOR_BLIND_PALETTES } from './constants';
=======
export {
  DEFAULT_ACCESSIBILITY,
  COLOR_BLIND_PALETTES,
} from './constants';

>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
export {
  calculateContrastRatio,
  checkContrast,
  getAccessibleAlternatives,
} from './contrast';
<<<<<<< HEAD
export {
  getAccessibleAlternatives as getAccessibleColorAlternatives,
} from './contrast';
export {
  getAccessibleColor,
  getStatusPattern,
} from './color-blind';
export {
  announce,
  getRecentAnnouncements,
  generateAccessibleLabel,
} from './screen-reader';
export {
  getAnimationConfig,
  getAnimationStyles,
  calculateScaledFontSize,
  getScaledTypography,
} from './motion';
export {
  registerFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
} from './focus';
export {
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  detectSystemAccessibility,
} from './preferences';
export { auditScreen } from './audit';
export type {
  AccessibilityPreferences,
  ContrastCheck,
  ColorBlindType,
  ColorBlindPalette,
  ScreenReaderAnnouncement,
  AnimationConfig,
  FocusableElement,
  AccessibilityAudit,
  AccessibilityIssue,
} from './types';

export class AccessibilitySystem {
  private preferences: AccessibilityPreferences;
  private initialized = false;
=======
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

export {
  getAccessibleColor,
  getStatusPattern,
  getColorBlindPalettes,
  isColorAccessibleForColorBlind,
} from './color-blind';

<<<<<<< HEAD
  /**
   * Initialize the accessibility system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {return;}

    // Load user preferences
    await this.loadPreferences();

    // Apply initial settings
    this.applySettings();

    // Set up event listeners
    this.setupEventListeners();

    this.initialized = true;

    eventBus.publish('accessibility:initialized', {
      preferences: this.preferences,
      timestamp: Date.now(),
    });
  }

  /**
   * Update accessibility preferences
   */
  async updatePreferences(updates: Partial<AccessibilityPreferences>): Promise<void> {
    const oldPreferences = { ...this.preferences };
    this.preferences = { ...this.preferences, ...updates };

    // Save preferences
    await this.savePreferences();

    // Apply new settings
    this.applySettings();

    // Emit change event
    eventBus.publish('accessibility:preferences_updated', {
      oldPreferences,
      newPreferences: this.preferences,
      changes: updates,
      timestamp: Date.now(),
    });
  }
=======
export {
  announce,
  getRecentAnnouncements,
  generateAccessibleLabel,
  clearOldAnnouncements,
} from './screen-reader';

export {
  getAnimationConfig,
  getAnimationStyles,
  calculateScaledFontSize,
  getScaledTypography,
} from './motion';

export {
  registerFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
  unregisterFocusableElement,
  getFocusableElements,
} from './focus';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

export {
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  resetAccessibilityPreferences,
  detectSystemAccessibility,
} from './preferences';

export {
  auditScreen,
  auditColorContrast,
} from './audit';

<<<<<<< HEAD
  /**
   * Check if reduced motion is enabled
   */
  isReducedMotionEnabled(): boolean {
    return this.preferences.reducedMotion;
  }

  /**
   * Check if high contrast is enabled
   */
  isHighContrastEnabled(): boolean {
    return this.preferences.highContrast;
  }

  /**
   * Get current text scale
   */
  getTextScale(): number {
    return this.preferences.textScale;
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    // Implementation would load from MMKV/SecureStorage
    // For now, use defaults
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    // Implementation would save to MMKV/SecureStorage
  }

  /**
   * Apply accessibility settings
   */
  private applySettings(): void {
    // Apply text scaling, motion settings, etc.
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for system accessibility changes
  }
}

// Singleton instance
let accessibilitySystem: AccessibilitySystem | null = null;

export function getAccessibilitySystem(): AccessibilitySystem {
  if (!accessibilitySystem) {
    accessibilitySystem = new AccessibilitySystem();
  }
  return accessibilitySystem;
}
=======
export type {
  AccessibilityPreferences,
  ColorBlindPalette,
  ContrastCheck,
  ScreenReaderAnnouncement,
  AnimationConfig,
  ColorBlindType,
  FocusableElement,
  AccessibilityIssue,
  AccessibilityAudit,
} from './types';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
