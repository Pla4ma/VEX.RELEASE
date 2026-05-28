import { Phase9ExitGate } from "../ExitGate";
import { offlineSyncService } from "../../features/session-completion/offline-sync-service";
import { ScreenErrorBoundary } from "../../errors/ScreenErrorBoundary";
import { AccessibilityAudit } from "../../accessibility/AccessibilityAudit";
import { PerformanceGate } from "../../performance/PerformanceGate";
import { PrivacyInventory } from "../../privacy/PrivacyInventory";
import { PaywallVerification } from "../../monetization/PaywallVerification";
import { AppStoreSubmissionPack } from "../../app-store/AppStoreSubmissionPack";
import {
  setupGreenMocks,
  setupCriticalMocks,
  setupModerateMocks,
  type ExitGateMocks,
} from "./ExitGate.test-helpers.integration";

jest.mock("../../features/session-completion/offline-sync-service");
jest.mock("../../errors/ScreenErrorBoundary");
jest.mock("../../accessibility/AccessibilityAudit");
jest.mock("../../performance/PerformanceGate");
jest.mock("../../privacy/PrivacyInventory");
jest.mock("../../monetization/PaywallVerification");
jest.mock("../../app-store/AppStoreSubmissionPack");

const mockOfflineSyncService = offlineSyncService as jest.Mocked<
  typeof offlineSyncService
>;
const mockScreenErrorBoundary = ScreenErrorBoundary as jest.Mocked<
  typeof ScreenErrorBoundary
>;
const mockAccessibilityAudit = AccessibilityAudit as jest.Mocked<
  typeof AccessibilityAudit
>;
const mockPerformanceGate = PerformanceGate as jest.Mocked<
  typeof PerformanceGate
>;
const mockPrivacyInventory = PrivacyInventory as jest.Mocked<
  typeof PrivacyInventory
>;
const mockPaywallVerification = PaywallVerification as jest.Mocked<
  typeof PaywallVerification
>;
const mockAppStoreSubmissionPack = AppStoreSubmissionPack as jest.Mocked<
  typeof AppStoreSubmissionPack
>;

const mocks: ExitGateMocks = {
  offlineSyncService: mockOfflineSyncService,
  screenErrorBoundary: mockScreenErrorBoundary,
  accessibilityAudit: mockAccessibilityAudit,
  performanceGate:
    mockPerformanceGate as jest.Mocked<Record<string, jest.Mock>>,
  privacyInventory: mockPrivacyInventory,
  paywallVerification:
    mockPaywallVerification as jest.Mocked<Record<string, jest.Mock>>,
  appStoreSubmissionPack: mockAppStoreSubmissionPack,
};

describe("Phase9ExitGate", () => {
  let exitGate: Phase9ExitGate;

  beforeEach(() => {
    exitGate = Phase9ExitGate.getInstance();
    jest.clearAllMocks();
  });

  describe("Full Exit Gate Execution", () => {
    it("should pass exit gate with all systems green", async () => {
      setupGreenMocks(mocks);
      const result = await exitGate.runExitGate();
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.deploymentReady).toBe(true);
      expect(result.blockingIssues).toHaveLength(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it("should fail exit gate with critical issues", async () => {
      setupCriticalMocks(mocks);
      const result = await exitGate.runExitGate();
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(85);
      expect(result.deploymentReady).toBe(false);
      expect(result.blockingIssues.length).toBeGreaterThan(0);
    });

    it("should generate appropriate recommendations", async () => {
      setupModerateMocks(mocks);
      const result = await exitGate.runExitGate();
      expect(result.recommendations).toContain(
        "Review and address offline-sync warnings",
      );
      expect(result.recommendations).toContain(
        "Review and address error-boundaries warnings",
      );
      expect(result.recommendations).toContain(
        "Review and address accessibility warnings",
      );
      expect(result.recommendations).toContain(
        "Improve performance score from 78 to 85+",
      );
      expect(result.recommendations).toContain(
        "Review and address privacy warnings",
      );
      expect(result.recommendations).toContain(
        "Review and address paywall warnings",
      );
      expect(result.recommendations).toContain(
        "Review and address app-store warnings",
      );
    });

    it("should track gate results", async () => {
      setupGreenMocks(mocks);
      const result = await exitGate.runExitGate();
      const gateResults = (
        exitGate as jest.Mocked<Record<string, unknown>>
      ).getGateResults();
      expect(gateResults).toHaveLength(1);
      expect(gateResults[0]).toBe(result);
    });
  });
});
