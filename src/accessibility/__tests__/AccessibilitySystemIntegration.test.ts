import { describe, it, expect } from "@jest/globals";
import { accessibilityAuditor } from "../AccessibilityAuditor";
import {
  checkContrast,
  getAccessibleAlternatives,
  getAccessibleColor,
} from "../AccessibilitySystem";
import "./setup";

describe("AccessibilitySystem Integration", () => {
  describe("Color Contrast Checking", () => {
    it("should calculate contrast ratio correctly", () => {
      const contrast = checkContrast("#000000", "#FFFFFF");
      expect(contrast.ratio).toBeCloseTo(21, 1);
      expect(contrast.passesAA).toBe(true);
      expect(contrast.passesAAA).toBe(true);
    });
    it("should fail insufficient contrast", () => {
      const contrast = checkContrast("#999999", "#FFFFFF");
      expect(contrast.ratio).toBeLessThan(4.5);
      expect(contrast.passesAA).toBe(false);
      expect(contrast.passesAAA).toBe(false);
    });
    it("should provide accessible alternatives", () => {
      const alternatives = getAccessibleAlternatives("#999999", "#FFFFFF");
      expect(alternatives).toBeInstanceOf(Array);
      expect(alternatives.length).toBeGreaterThan(0);
    });
    it("should provide color blind friendly colors", () => {
      const color = getAccessibleColor("primary", "protanopia");
      expect(color).toBeDefined();
      expect(color).toMatch(/^#[0-9A-F]{6}$/);
    });
  });
  describe("WCAG Compliance", () => {
    it("should meet WCAG 2.1 AA standards for basic components", async () => {
      const auditor = accessibilityAuditor;
      const accessibleComponent = {
        type: "Button",
        props: {
          accessibilityLabel: "Accessible Button",
          accessibilityRole: "button",
          accessibilityHint: "Activates this control",
          style: { color: "#000000", backgroundColor: "#FFFFFF" },
        },
      };
      const result = await auditor.auditComponent(accessibleComponent);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.summary.critical).toBe(0);
      expect(result.summary.major).toBe(0);
    });
    it("should identify WCAG guideline violations", async () => {
      const auditor = accessibilityAuditor;
      const inaccessibleComponent = {
        type: "Button",
        props: { style: { color: "#999999", backgroundColor: "#FFFFFF" } },
      };
      const result = await auditor.auditComponent(inaccessibleComponent);
      expect(result.issues.length).toBeGreaterThan(0);
      const hasContrastIssue = result.issues.some(
        (issue) => issue.category === "contrast",
      );
      const hasLabelIssue = result.issues.some(
        (issue) => issue.category === "screen-reader",
      );
      expect(hasContrastIssue).toBe(true);
      expect(hasLabelIssue).toBe(true);
    });
  });
});
