import {
  RetentionUserProfileSchema,
  ChallengeExpiryCandidateSchema,
  NotificationCenterTypeSchema,
  NotificationCenterItemSchema,
} from "../schemas";

describe("Schemas", () => {
  describe("RetentionUserProfileSchema", () => {
    it("accepts valid profile", () => {
      const result = RetentionUserProfileSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
      });
      expect(result.firstName).toBe("John");
    });

    it("accepts null firstName", () => {
      const result = RetentionUserProfileSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: null,
      });
      expect(result.firstName).toBeNull();
    });
  });

  describe("ChallengeExpiryCandidateSchema", () => {
    it("accepts valid candidate", () => {
      const result = ChallengeExpiryCandidateSchema.parse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        challengeId: "ch-1",
        title: "Test Challenge",
        currentValue: 5,
        targetValue: 10,
        expiresAt: Date.now() + 3600000,
      });
      expect(result.currentValue).toBe(5);
    });

    it("rejects currentValue that is negative", () => {
      expect(() =>
        ChallengeExpiryCandidateSchema.parse({
          userId: "550e8400-e29b-41d4-a716-446655440000",
          challengeId: "ch-1",
          title: "Test",
          currentValue: -1,
          targetValue: 10,
          expiresAt: Date.now() + 3600000,
        }),
      ).toThrow();
    });

    it("rejects zero targetValue", () => {
      expect(() =>
        ChallengeExpiryCandidateSchema.parse({
          userId: "550e8400-e29b-41d4-a716-446655440000",
          challengeId: "ch-1",
          title: "Test",
          currentValue: 0,
          targetValue: 0,
          expiresAt: Date.now() + 3600000,
        }),
      ).toThrow();
    });
  });

  describe("NotificationCenterTypeSchema", () => {
    it("accepts all valid types", () => {
      const types = ["ACHIEVEMENT", "STREAK_RISK", "BOSS", "SQUAD", "RIVAL", "COACH", "REWARD", "LEVEL_UP"];
      for (const type of types) {
        expect(NotificationCenterTypeSchema.parse(type)).toBe(type);
      }
    });

    it("rejects invalid type", () => {
      expect(() => NotificationCenterTypeSchema.parse("UNKNOWN")).toThrow();
    });
  });

  describe("NotificationCenterItemSchema", () => {
    const validItem = {
      id: "notif-1",
      type: "ACHIEVEMENT" as const,
      title: "Achievement!",
      message: "You did it!",
      timestamp: Date.now(),
      read: false,
    };

    it("accepts valid item", () => {
      const result = NotificationCenterItemSchema.parse(validItem);
      expect(result.id).toBe("notif-1");
    });

    it("accepts item with optional fields", () => {
      const result = NotificationCenterItemSchema.parse({
        ...validItem,
        avatar: "https://example.com/avatar.png",
        actionText: "View",
        actionRoute: "/achievements",
        actionParams: { id: "123" },
      });
      expect(result.avatar).toBe("https://example.com/avatar.png");
      expect(result.actionParams).toEqual({ id: "123" });
    });

    it("rejects extra fields (strict)", () => {
      expect(() =>
        NotificationCenterItemSchema.parse({ ...validItem, extra: true }),
      ).toThrow();
    });
  });
});
