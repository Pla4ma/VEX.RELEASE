import {
  RetentionReminderTypeSchema,
  ReminderMetadataSchema,
  ReminderPlanInputSchema,
  ReminderPlanRowSchema,
} from "../schemas";

describe("Schemas", () => {
  describe("RetentionReminderTypeSchema", () => {
    it("accepts valid reminder types", () => {
      expect(RetentionReminderTypeSchema.parse("RETENTION_ONBOARDING_DAY_1")).toBe("RETENTION_ONBOARDING_DAY_1");
      expect(RetentionReminderTypeSchema.parse("RETENTION_STREAK_PROTECTION")).toBe("RETENTION_STREAK_PROTECTION");
    });

    it("rejects invalid reminder types", () => {
      expect(() => RetentionReminderTypeSchema.parse("INVALID_TYPE")).toThrow();
    });
  });

  describe("ReminderMetadataSchema", () => {
    it("accepts any record", () => {
      expect(ReminderMetadataSchema.parse({ key: "value", num: 42 })).toEqual({ key: "value", num: 42 });
    });

    it("accepts empty object", () => {
      expect(ReminderMetadataSchema.parse({})).toEqual({});
    });
  });

  describe("ReminderPlanInputSchema", () => {
    const validInput = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      type: "RETENTION_ONBOARDING_DAY_1" as const,
      scheduledFor: Date.now() + 86400000,
      message: "Test reminder",
      metadata: { day: 1 },
    };

    it("accepts valid input", () => {
      const result = ReminderPlanInputSchema.parse(validInput);
      expect(result.userId).toBe(validInput.userId);
      expect(result.type).toBe(validInput.type);
    });

    it("rejects invalid UUID", () => {
      expect(() =>
        ReminderPlanInputSchema.parse({ ...validInput, userId: "not-a-uuid" }),
      ).toThrow();
    });

    it("rejects empty message", () => {
      expect(() =>
        ReminderPlanInputSchema.parse({ ...validInput, message: "" }),
      ).toThrow();
    });

    it("rejects message over 500 chars", () => {
      expect(() =>
        ReminderPlanInputSchema.parse({ ...validInput, message: "a".repeat(501) }),
      ).toThrow();
    });

    it("rejects non-positive scheduledFor", () => {
      expect(() =>
        ReminderPlanInputSchema.parse({ ...validInput, scheduledFor: 0 }),
      ).toThrow();
    });
  });

  describe("ReminderPlanRowSchema", () => {
    it("accepts valid row with defaults", () => {
      const row = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        reminder_type: "RETENTION_STREAK_PROTECTION",
        scheduled_for: Date.now(),
        status: "SCHEDULED",
        context: { message: "test", metadata: {} },
        created_at: Date.now(),
      };
      const result = ReminderPlanRowSchema.parse(row);
      expect(result.delivery_method).toBe("BOTH");
      expect(result.status).toBe("SCHEDULED");
    });

    it("rejects invalid status", () => {
      expect(() =>
        ReminderPlanRowSchema.parse({
          id: "550e8400-e29b-41d4-a716-446655440000",
          user_id: "550e8400-e29b-41d4-a716-446655440001",
          reminder_type: "RETENTION_STREAK_PROTECTION",
          scheduled_for: Date.now(),
          status: "INVALID",
          context: { message: "test", metadata: {} },
          created_at: Date.now(),
        }),
      ).toThrow();
    });
  });
});
