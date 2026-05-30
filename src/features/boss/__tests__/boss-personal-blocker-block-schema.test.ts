import {
  PersonalBlockerBlockSchema,
} from "../types";

describe("PersonalBlockerBlockSchema", () => {
  it("parses a valid blocker block with all required fields", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "blocker-1",
      label: "Procrastination",
      triggerAfterSessions: 3,
    });
    expect(result.id).toBe("blocker-1");
    expect(result.label).toBe("Procrastination");
    expect(result.triggerAfterSessions).toBe(3);
  });

  it("accepts all valid motivationStyle values", () => {
    const styles = ["calm", "study", "game_like", "intense"] as const;
    for (const style of styles) {
      const result = PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: style,
      });
      expect(result.motivationStyle).toBe(style);
    }
  });

  it("works without motivationStyle (optional field)", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b2",
      label: "Distraction",
      triggerAfterSessions: 0,
    });
    expect(result.motivationStyle).toBeUndefined();
  });

  it("rejects invalid motivationStyle value", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: "invalid_style",
      }),
    ).toThrow();
  });

  it("rejects negative triggerAfterSessions", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: -1,
      }),
    ).toThrow();
  });

  it("rejects non-integer triggerAfterSessions", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1.5,
      }),
    ).toThrow();
  });

  it("accepts triggerAfterSessions of 0", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b",
      label: "L",
      triggerAfterSessions: 0,
    });
    expect(result.triggerAfterSessions).toBe(0);
  });

  it("accepts large triggerAfterSessions values", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b",
      label: "L",
      triggerAfterSessions: 9999,
    });
    expect(result.triggerAfterSessions).toBe(9999);
  });
});
