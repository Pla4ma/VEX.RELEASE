import {
  COACH_PRESENCE_MESSAGE_CONTEXTS,
  COACH_PRESENCE_MESSAGE_STYLES,
  getCoachPresenceMessage,
} from "../message-library";

describe("CoachPresence message library", () => {
  it("covers every required context and tone variant", () => {
    for (const context of COACH_PRESENCE_MESSAGE_CONTEXTS) {
      for (const style of COACH_PRESENCE_MESSAGE_STYLES) {
        const message = getCoachPresenceMessage({ context, style });
        expect(message).toMatchSnapshot(`${context}:${style}`);
        expect(message.length).toBeLessThanOrEqual(96);
        expect(message).not.toMatch(
          /great job|keep going|you can do it|unlock your potential/i,
        );
      }
    }
  });

  it("keeps boss and damage language to game-like or intense users", () => {
    const calm = getCoachPresenceMessage({
      context: "strong_streak",
      style: "calm",
    });
    const gameLike = getCoachPresenceMessage({
      context: "strong_streak",
      style: "game_like",
    });

    expect(calm).not.toMatch(/boss|damage|run/i);
    expect(gameLike).toMatch(/run|damage|boss/i);
  });

  it("returns a safe fallback when AI is unavailable", () => {
    const fallback = getCoachPresenceMessage({
      context: "ai_fallback_unavailable",
      style: "coach_led",
    });

    expect(fallback).toContain("Start");
    expect(fallback).not.toMatch(/AI|model|provider/i);
  });
});
