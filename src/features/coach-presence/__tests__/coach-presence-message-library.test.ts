/**
 * Coach Presence — Message Library Tests
 */

import { getCoachPresenceMessage as getLibraryMessage, COACH_PRESENCE_MESSAGE_CONTEXTS } from "../message-library";

describe("message-library", () => {
  test("COACH_PRESENCE_MESSAGE_CONTEXTS has expected contexts", () => {
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("day_0_after_motivation");
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("comeback_session");
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("strong_streak");
  });

  test("getCoachPresenceMessage returns a message for every context+style combination", () => {
    const contexts: Array<"day_0_after_motivation" | "first_session_start" | "comeback_session" | "calm_user_completion"> = [
      "day_0_after_motivation",
      "first_session_start",
      "comeback_session",
      "calm_user_completion",
    ];
    const styles: Array<"calm" | "friendly" | "coach_led" | "game_like" | "intense" | "study_focused"> = [
      "calm", "friendly", "coach_led", "game_like", "intense", "study_focused",
    ];
    for (const context of contexts) {
      for (const style of styles) {
        const msg = getLibraryMessage({ context, style });
        expect(msg).toBeTruthy();
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    }
  });

  test("messages are within 96 character limit", () => {
    const contexts: Array<"day_0_after_motivation" | "first_session_start" | "comeback_session"> = [
      "day_0_after_motivation", "first_session_start", "comeback_session",
    ];
    for (const context of contexts) {
      const msg = getLibraryMessage({ context, style: "calm" });
      expect(msg.length).toBeLessThanOrEqual(96);
    }
  });
});
