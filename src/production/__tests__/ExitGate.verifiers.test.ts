import { Phase9ExitGate } from "../ExitGate";
import { offlineSyncService } from "../../features/session-completion/offline-sync-service";
import { ScreenErrorBoundary } from "../../errors/ScreenErrorBoundary";
import { AccessibilityAudit } from "../../accessibility/AccessibilityAudit";
import {
  greenOfflineSyncReport,
  moderateOfflineSyncReport,
  criticalOfflineSyncReport,
  greenErrorBoundaryReport,
  moderateErrorBoundaryReport,
  criticalErrorBoundaryReport,
  greenAccessibilityReport,
  moderateAccessibilityReport,
  criticalAccessibilityReport,
} from "./ExitGate.test-helpers";

jest.mock("../../features/session-completion/offline-sync-service");
jest.mock("../../errors/ScreenErrorBoundary");
jest.mock("../../accessibility/AccessibilityAudit");

const mockOfflineSyncService = offlineSyncService as jest.Mocked<
  typeof offlineSyncService
>;
const mockScreenErrorBoundary = ScreenErrorBoundary as jest.Mocked<
  typeof ScreenErrorBoundary
>;
const mockAccessibilityAudit = AccessibilityAudit as jest.Mocked<
  typeof AccessibilityAudit
>;

describe("Phase9ExitGate", () => {
  let exitGate: Phase9ExitGate;

  beforeEach(() => {
    exitGate = Phase9ExitGate.getInstance();
    jest.clearAllMocks();
  });

  describe("Offline Sync Verification", () => {
    it("should pass offline sync verification with good metrics", async () => {
      mockOfflineSyncService.generateHealthReport.mockResolvedValue(
        greenOfflineSyncReport,
      );
      const result = await exitGate.verifyOfflineSync();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate offline sync issues", async () => {
      mockOfflineSyncService.generateHealthReport.mockResolvedValue(
        moderateOfflineSyncReport,
      );
      const result = await exitGate.verifyOfflineSync();
      expect(result.status).toBe("warning");
      expect(result.score).toBeLessThan(100);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail offline sync verification with critical issues", async () => {
      mockOfflineSyncService.generateHealthReport.mockResolvedValue(
        criticalOfflineSyncReport,
      );
      const result = await exitGate.verifyOfflineSync();
      expect(result.status).toBe("fail");
      expect(result.score).toBeLessThan(70);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle offline sync verification errors", async () => {
      mockOfflineSyncService.generateHealthReport.mockRejectedValue(
        new Error("Service unavailable"),
      );
      const result = await exitGate.verifyOfflineSync();
      expect(result.status).toBe("fail");
      expect(result.score).toBe(0);
      expect(result.issues).toContain(
        "Offline sync verification failed: Service unavailable",
      );
    });
  });

  describe("Error Boundaries Verification", () => {
    it("should pass error boundaries verification with good metrics", async () => {
      mockScreenErrorBoundary.generateReport.mockResolvedValue(
        greenErrorBoundaryReport,
      );
      const result = await exitGate.verifyErrorBoundaries();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate error boundary issues", async () => {
      mockScreenErrorBoundary.generateReport.mockResolvedValue(
        moderateErrorBoundaryReport,
      );
      const result = await exitGate.verifyErrorBoundaries();
      expect(result.status).toBe("warning");
      expect(result.score).toBeLessThan(100);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail error boundaries verification with critical issues", async () => {
      mockScreenErrorBoundary.generateReport.mockResolvedValue(
        criticalErrorBoundaryReport,
      );
      const result = await exitGate.verifyErrorBoundaries();
      expect(result.status).toBe("fail");
      expect(result.score).toBeLessThan(75);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility Verification", () => {
    it("should pass accessibility verification with WCAG AA compliance", async () => {
      mockAccessibilityAudit.generateComplianceReport.mockResolvedValue(
        greenAccessibilityReport,
      );
      const result = await exitGate.verifyAccessibility();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate accessibility issues", async () => {
      mockAccessibilityAudit.generateComplianceReport.mockResolvedValue(
        moderateAccessibilityReport,
      );
      const result = await exitGate.verifyAccessibility();
      expect(result.status).toBe("warning");
      expect(result.score).toBeLessThan(100);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail accessibility verification with WCAG A only", async () => {
      mockAccessibilityAudit.generateComplianceReport.mockResolvedValue(
        criticalAccessibilityReport,
      );
      const result = await exitGate.verifyAccessibility();
      expect(result.status).toBe("fail");
      expect(result.score).toBeLessThan(70);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});
