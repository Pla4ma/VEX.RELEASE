import { Phase9ExitGate } from "../ExitGate";
import { PaywallVerification } from "../../monetization/PaywallVerification";
import { AppStoreSubmissionPack } from "../../app-store/AppStoreSubmissionPack";
import {
  greenPaywallResult,
  moderatePaywallResult,
  criticalPaywallResult,
  greenAppStoreResult,
  moderateAppStoreResult,
  criticalAppStoreResult,
} from "./ExitGate.test-helpers.monetization";

jest.mock("../../monetization/PaywallVerification");
jest.mock("../../app-store/AppStoreSubmissionPack");

const mockPaywallVerification = PaywallVerification as jest.Mocked<
  typeof PaywallVerification
>;
const mockAppStoreSubmissionPack = AppStoreSubmissionPack as jest.Mocked<
  typeof AppStoreSubmissionPack
>;

describe("Phase9ExitGate", () => {
  let exitGate: Phase9ExitGate;

  beforeEach(() => {
    exitGate = Phase9ExitGate.getInstance();
    jest.clearAllMocks();
  });

  describe("Paywall Verification", () => {
    it("should pass paywall verification with full compliance", async () => {
      (
        mockPaywallVerification as jest.Mocked<Record<string, jest.Mock>>
      ).performFullVerification.mockResolvedValue(greenPaywallResult);
      const result = await exitGate.verifyPaywall();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(92);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate paywall issues", async () => {
      (
        mockPaywallVerification as jest.Mocked<Record<string, jest.Mock>>
      ).performFullVerification.mockResolvedValue(moderatePaywallResult);
      const result = await exitGate.verifyPaywall();
      expect(result.status).toBe("warning");
      expect(result.score).toBe(78);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail paywall verification with critical issues", async () => {
      (
        mockPaywallVerification as jest.Mocked<Record<string, jest.Mock>>
      ).performFullVerification.mockResolvedValue(criticalPaywallResult);
      const result = await exitGate.verifyPaywall();
      expect(result.status).toBe("fail");
      expect(result.score).toBe(65);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("App Store Verification", () => {
    it("should pass App Store verification with full readiness", async () => {
      mockAppStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(
        greenAppStoreResult,
      );
      const result = await exitGate.verifyAppStore();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(94);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate App Store issues", async () => {
      mockAppStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(
        moderateAppStoreResult,
      );
      const result = await exitGate.verifyAppStore();
      expect(result.status).toBe("warning");
      expect(result.score).toBe(88);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail App Store verification with critical issues", async () => {
      mockAppStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(
        criticalAppStoreResult,
      );
      const result = await exitGate.verifyAppStore();
      expect(result.status).toBe("fail");
      expect(result.score).toBe(72);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});
