import {
  PersonalBlockerBlockSchema,
  PersonalBossBlockSchema,
} from "../types";

describe("PersonalBossBlockSchema (legacy alias)", () => {
  it("is the exact same object reference as PersonalBlockerBlockSchema", () => {
    expect(PersonalBossBlockSchema).toBe(PersonalBlockerBlockSchema);
  });

  it("validates the same data identically", () => {
    const data = { id: "b", label: "Test", triggerAfterSessions: 5 };
    expect(PersonalBossBlockSchema.parse(data)).toEqual(
      PersonalBlockerBlockSchema.parse(data),
    );
  });
});
