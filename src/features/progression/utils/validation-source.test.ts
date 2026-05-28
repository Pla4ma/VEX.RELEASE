/**
 * Progression Validation Tests — XPSourceSchema
 *
 * @phase 3 - Deepening: Validation tests
 */

import { XPSourceSchema } from "./validation";

describe("XPSourceSchema", () => {
  it("should validate valid sources", () => {
    expect(XPSourceSchema.parse("SESSION_COMPLETE")).toBe("SESSION_COMPLETE");
    expect(XPSourceSchema.parse("BOSS_DEFEAT")).toBe("BOSS_DEFEAT");
  });

  it("should reject invalid sources", () => {
    expect(() => XPSourceSchema.parse("INVALID")).toThrow();
  });
});
