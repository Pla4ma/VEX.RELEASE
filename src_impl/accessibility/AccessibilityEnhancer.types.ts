export interface EnhancedAccessibilityProps {
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: string;
    accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
    accessibilityDescribedBy?: string;
    accessibilityLabelledBy?: string;
    accessibilityExpanded?: boolean;
    accessibilitySelected?: boolean;
    accessibilityValueMax?: number;
    accessibilityValueMin?: number;
    accessibilityValueNow?: number;
    accessibilityValueText?: string;
    accessibilityValueStep?: number;
    accessibilityViewIsModal?: boolean;
    accessibilityElementsHidden?: boolean;
    accessibilityIgnoresInvertColors?: boolean;
    accessibilityIgnoresPageScaling?: boolean;
    accessibilityReduceMotion?: boolean;
    accessibilityLanguage?: string;
    accessibilityAutoComplete?: string;
    accessibilityAutoCorrect?: string;
    accessibilityRequired?: boolean;
    accessibilityInvalid?: boolean;
    style?: React.ComponentProps<React.ComponentType<Record<string, unknown>>>['style'];
}

export interface AccessibilityEnhancement {
    type: 'contrast' | 'focus' | 'motion' | 'screen-reader' | 'touch' | 'keyboard';
    priority: 'critical' | 'major' | 'moderate' | 'minor';
    enhancement: React.ComponentType<Record<string, unknown>> | EnhancedAccessibilityProps;
    description: string;
    wcagGuideline: string;
}

export interface AccessibilityEnhancementConfig {
    /** Enable automatic contrast improvements */
    autoContrastFixes: boolean;
    /** Enable automatic focus management */
    autoFocusManagement: boolean;
    /** Enable motion optimizations */
    motionOptimizations: boolean;
    /** Enable screen reader optimizations */
    screenReaderOptimizations: boolean;
    /** Color blind mode support */
    colorBlindSupport: ColorBlindType;
    /** Custom enhancement rules */
    customEnhancements?: AccessibilityEnhancement[];
}
