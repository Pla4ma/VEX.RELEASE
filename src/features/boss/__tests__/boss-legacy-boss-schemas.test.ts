import {
  BossRewardTypeSchema,
  BossEncounterStatusSchema,
  BossTemplateSchema,
  BossEncounterSummarySchema,
} from "../schemas";

describe("Legacy boss schemas", () => {
  it("BossRewardTypeSchema accepts only 'XP'", () => {
    expect(BossRewardTypeSchema.parse("XP")).toBe("XP");
    expect(() => BossRewardTypeSchema.parse("GOLD")).toThrow();
  });

  it("BossEncounterStatusSchema accepts only 'ACTIVE'", () => {
    expect(BossEncounterStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
    expect(() => BossEncounterStatusSchema.parse("COMPLETED")).toThrow();
  });

  it("BossTemplateSchema parses partial objects with any combination of fields", () => {
    expect(BossTemplateSchema.parse({ id: "t1" }).id).toBe("t1");
    expect(BossTemplateSchema.parse({ name: "Dragon" }).name).toBe("Dragon");
    expect(BossTemplateSchema.parse({ tier: 3 }).tier).toBe(3);
    expect(BossTemplateSchema.parse({}).id).toBeUndefined();
  });

  it("BossEncounterSummarySchema parses empty object", () => {
    expect(BossEncounterSummarySchema.parse({})).toEqual({});
  });

  it("BossEncounterSummarySchema strips unknown keys (strict partial)", () => {
    const result = BossEncounterSummarySchema.parse({ extra: "field" });
    expect(result).toEqual({});
  });
});
