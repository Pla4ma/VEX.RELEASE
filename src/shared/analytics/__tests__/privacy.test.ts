import {
  sanitizeAnalyticsProperties,
  sanitizeEventName,
  sanitizeUserTraits,
} from "../privacy";

describe("analytics privacy helpers", () => {
  it("normalizes event names to snake case", () => {
    expect(sanitizeEventName("Session:Completed")).toBe("session_completed");
    expect(sanitizeEventName("paywall viewed")).toBe("paywall_viewed");
  });

  it("drops private or sensitive event properties", () => {
    const result = sanitizeAnalyticsProperties({
      userId: "user-123",
      email: "person@example.com",
      sessionId: "session-123",
      token: "secret-token",
      noteText: "private note",
      durationSeconds: 1500,
      completed: true,
      nested: { unsafe: true },
    });

    expect(result).toEqual({
      session_id: "session-123",
      duration_seconds: 1500,
      completed: true,
    });
  });

  it("only keeps allowlisted user traits", () => {
    const result = sanitizeUserTraits({
      email: "person@example.com",
      name: "Private Name",
      level: 12,
      streak: 7,
      plan: "free",
    });

    expect(result).toEqual({
      level: 12,
      streak: 7,
      plan: "free",
    });
  });
});
