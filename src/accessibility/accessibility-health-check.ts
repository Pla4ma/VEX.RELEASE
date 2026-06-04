import type { AccessibilityEnhancementConfig } from './enhancer-types';

export function performHealthCheck(
  config: AccessibilityEnhancementConfig,
): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!config.autoContrastFixes) {
    issues.push('Contrast auto-fixes disabled');
    recommendations.push('Enable contrast auto-fixes');
  }
  if (!config.autoFocusManagement) {
    issues.push('Focus management disabled');
    recommendations.push('Enable focus management');
  }
  if (!config.motionOptimizations) {
    issues.push('Motion optimizations disabled');
    recommendations.push('Enable motion optimizations');
  }
  if (!config.screenReaderOptimizations) {
    issues.push('Screen reader optimizations disabled');
    recommendations.push('Enable screen reader optimizations');
  }

  const score =
    (config.autoContrastFixes ? 25 : 0) +
    (config.autoFocusManagement ? 25 : 0) +
    (config.motionOptimizations ? 25 : 0) +
    (config.screenReaderOptimizations ? 25 : 0);

  return { score, issues, recommendations };
}
