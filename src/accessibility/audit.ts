/**
 * Accessibility screen auditing.
 */

import type { AccessibilityAudit, AccessibilityIssue } from "./types";
import { calculateContrastRatio } from "./contrastUtils";
import { getAccessibleAlternatives } from "./contrastUtils";

export function auditScreen(
  screenId: string,
  elements: Array<{
    id: string;
    type: string;
    label?: string;
    color?: string;
    backgroundColor?: string;
    touchSize?: { width: number; height: number };
  }>,
): AccessibilityAudit {
  const issues: AccessibilityIssue[] = [];

  for (const element of elements) {
    if (element.color && element.backgroundColor) {
      const contrast = calculateContrastRatio(
        element.color,
        element.backgroundColor,
      );
      if (contrast < 4.5) {
        const alternatives = getAccessibleAlternatives(
          element.color,
          element.backgroundColor,
          4.5,
        );
        issues.push({
          id: `contrast-${element.id}`,
          type: "contrast",
          severity: "error",
          element: element.id,
          message: `Contrast ratio ${contrast.toFixed(2)} is below WCAG AA (4.5)`,
          suggestion: alternatives[0]
            ? `Try color: ${alternatives[0]}`
            : "Use a darker foreground or lighter background",
        });
      }
    }

    if (element.touchSize) {
      const minSize = 44;
      if (
        element.touchSize.width < minSize ||
        element.touchSize.height < minSize
      ) {
        issues.push({
          id: `touch-${element.id}`,
          type: "touch_target",
          severity: "warning",
          element: element.id,
          message: `Touch target ${element.touchSize.width}x${element.touchSize.height} is below recommended ${minSize}x${minSize}`,
          suggestion: "Increase touch target to at least 44x44 points",
        });
      }
    }

    if (!element.label && ["button", "link", "input"].includes(element.type)) {
      issues.push({
        id: `label-${element.id}`,
        type: "label",
        severity: "error",
        element: element.id,
        message: "Interactive element missing accessible label",
        suggestion: "Add an accessibleLabel or aria-label attribute",
      });
    }
  }

  const score = Math.max(
    0,
    100 -
      issues.filter((i) => i.severity === "error").length * 10 -
      issues.filter((i) => i.severity === "warning").length * 5,
  );

  return { screenId, timestamp: Date.now(), issues, score };
}
