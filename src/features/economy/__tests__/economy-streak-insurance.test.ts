/**
 * Tests for StreakInsurance functionality
 */

import {
  getInsuranceStatus,
  consumeInsurance,
} from "../StreakInsurance";
import type { StreakInsuranceStatus, ConsumeInsuranceInput } from "../StreakInsurance";

describe("getInsuranceStatus", () => {
  it("returns not insured with 0 days remaining", () => {
    const status = getInsuranceStatus();
    expect(status.isInsured).toBe(false);
    expect(status.daysRemaining).toBe(0);
  });

  it("returns StreakInsuranceStatus shape", () => {
    const status: StreakInsuranceStatus = getInsuranceStatus();
    expect(status).toHaveProperty("isInsured");
    expect(status).toHaveProperty("daysRemaining");
  });
});

describe("consumeInsurance", () => {
  it("returns failed status with all expected fields", async () => {
    const result = await consumeInsurance({
      userId: "user-1",
      insuranceId: "ins-1",
    });
    expect(result.isInsured).toBe(false);
    expect(result.daysRemaining).toBe(0);
    expect(result.success).toBe(false);
    expect(result.restoredDays).toBe(0);
  });

  it("works with any input values", async () => {
    const result = await consumeInsurance({
      userId: "any-user",
      insuranceId: "any-insurance",
    });
    expect(result.success).toBe(false);
  });
});
