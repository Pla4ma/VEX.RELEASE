import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  AccessibilityAuditor,
  accessibilityAuditor,
  type AuditElement,
} from "../AccessibilityAuditor";
import "./setup";

describe("AccessibilityAuditor", () => {
  let auditor: AccessibilityAuditor;
  let mockComponent: AuditElement;
  beforeEach(() => {
    jest.clearAllMocks();
    auditor = accessibilityAuditor;
    mockComponent = {
      type: "Button",
      props: {
        accessibilityLabel: "Test Button",
        style: { color: "#000000", backgroundColor: "#FFFFFF" },
      },
    };
  });
  describe("Component Auditing", () => {
    it("should audit component with accessibility labels", async () => {
      const result = await auditor.auditComponent(mockComponent);
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBe(100);
      expect(result.passedChecks).toContain("missing-accessibility-label");
    });
    it("should detect missing accessibility labels", async () => {
      const componentWithoutLabel = {
        ...mockComponent,
        props: { ...mockComponent.props, accessibilityLabel: undefined },
      };
      const result = await auditor.auditComponent(componentWithoutLabel);
      const labelIssue = result.issues.find(
        (issue) => issue.id === "missing-accessibility-label",
      );
      expect(labelIssue).toBeDefined();
      expect(labelIssue?.type).toBe("error");
      expect(labelIssue?.category).toBe("screen-reader");
      expect(labelIssue?.severity).toBe("critical");
    });
    it("should detect insufficient color contrast", async () => {
      const componentWithPoorContrast = {
        ...mockComponent,
        props: {
          ...mockComponent.props,
          style: { color: "#999999", backgroundColor: "#FFFFFF" },
        },
      };
      const result = await auditor.auditComponent(componentWithPoorContrast);
      const contrastIssue = result.issues.find(
        (issue) => issue.id === "insufficient-contrast",
      );
      expect(contrastIssue).toBeDefined();
      expect(contrastIssue?.type).toBe("error");
      expect(contrastIssue?.category).toBe("contrast");
      expect(contrastIssue?.severity).toBe("critical");
    });
    it("should detect touch targets that are too small", async () => {
      const componentWithSmallTouchTarget = {
        ...mockComponent,
        props: { ...mockComponent.props, style: { width: 30, height: 30 } },
      };
      const result = await auditor.auditComponent(
        componentWithSmallTouchTarget,
      );
      const touchIssue = result.issues.find(
        (issue) => issue.id === "touch-target-too-small",
      );
      expect(touchIssue).toBeDefined();
      expect(touchIssue?.type).toBe("error");
      expect(touchIssue?.category).toBe("touch");
      expect(touchIssue?.severity).toBe("major");
    });
    it("should categorize issues by severity", async () => {
      const componentWithMultipleIssues = {
        ...mockComponent,
        props: {
          ...mockComponent.props,
          accessibilityLabel: undefined,
          style: { width: 30, height: 30 },
        },
      };
      const result = await auditor.auditComponent(componentWithMultipleIssues);
      expect(result.summary.critical).toBe(1);
      expect(result.summary.major).toBe(1);
      expect(result.summary.moderate).toBe(0);
      expect(result.summary.minor).toBe(0);
      expect(result.score).toBeLessThan(100);
    });
  });
  describe("Screen Auditing", () => {
    it("should audit screen structure", async () => {
      const mockScreen = {
        type: "View",
        children: [
          { type: "Text", props: { accessibilityRole: "heading" } },
          { type: "Text", props: { accessibilityRole: "heading" } },
          { type: "Button", props: { accessibilityLabel: "Action" } },
        ],
      };
      const result = await auditor.auditScreen("TestScreen", mockScreen);
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBe(100);
    });
    it("should detect invalid heading hierarchy", async () => {
      const mockScreenWithBadHeadings = {
        type: "View",
        children: [
          { type: "Text", props: { accessibilityRole: "heading" } },
          { type: "Text", props: { accessibilityRole: "heading" } },
          { type: "Text", props: { accessibilityRole: "heading" } },
        ],
      };
      const result = await auditor.auditScreen(
        "TestScreen",
        mockScreenWithBadHeadings,
      );
      const headingIssue = result.issues.find(
        (issue) => issue.id === "invalid-heading-structure",
      );
      expect(headingIssue).toBeDefined();
      expect(headingIssue?.type).toBe("error");
      expect(headingIssue?.category).toBe("semantic");
      expect(headingIssue?.severity).toBe("major");
    });
  });
  describe("Audit History", () => {
    it("should maintain audit history", async () => {
      const result1 = await auditor.auditComponent(mockComponent);
      const result2 = await auditor.auditComponent(mockComponent);
      const history = auditor.getAuditHistory();
      expect(history).toHaveLength(2);
      expect(history).toContain(result1);
      expect(history).toContain(result2);
      expect(history[0].timestamp).toBeLessThanOrEqual(history[1].timestamp);
    });
    it("should clear audit history", () => {
      auditor.clearAuditHistory();
      const history = auditor.getAuditHistory();
      expect(history).toHaveLength(0);
    });
  });
  describe("Report Generation", () => {
    it("should generate detailed accessibility report", async () => {
      const componentWithIssues = {
        ...mockComponent,
        props: {
          ...mockComponent.props,
          accessibilityLabel: undefined,
          style: { width: 30, height: 30 },
        },
      };
      const result = await auditor.auditComponent(componentWithIssues);
      const report = auditor.generateReport(result);
      expect(report).toContain("# Accessibility Audit Report");
      expect(report).toContain("**Overall Score:");
      expect(report).toContain("## Issue Summary");
      expect(report).toContain("Critical: 1");
      expect(report).toContain("Major: 1");
      expect(report).toContain("## Issues Found");
      expect(report).toContain("missing-accessibility-label");
      expect(report).toContain("touch-target-too-small");
    });
  });
});
