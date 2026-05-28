import { Phase9ExitGate } from "../ExitGate";
import { PrivacyInventory } from "../../privacy/PrivacyInventory";
import {
  greenPrivacyReport,
  moderatePrivacyReport,
  criticalPrivacyReport,
} from "./ExitGate.test-helpers";

jest.mock("../../privacy/PrivacyInventory");

const mockPrivacyInventory = PrivacyInventory as jest.Mocked<
  typeof PrivacyInventory
>;

describe("Phase9ExitGate", () => {
  let exitGate: Phase9ExitGate;

  beforeEach(() => {
    exitGate = Phase9ExitGate.getInstance();
    jest.clearAllMocks();
  });

  describe("Privacy Verification", () => {
    it("should pass privacy verification with full compliance", async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue(
        greenPrivacyReport,
      );
      const result = await exitGate.verifyPrivacy();
      expect(result.status).toBe("pass");
      expect(result.score).toBe(98);
      expect(result.issues).toHaveLength(0);
    });

    it("should warn on moderate privacy issues", async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue(
        moderatePrivacyReport,
      );
      const result = await exitGate.verifyPrivacy();
      expect(result.status).toBe("warning");
      expect(result.score).toBe(82);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should fail privacy verification with GDPR non-compliance", async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue(
        criticalPrivacyReport,
      );
      const result = await exitGate.verifyPrivacy();
      expect(result.status).toBe("fail");
      expect(result.score).toBe(45);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});
