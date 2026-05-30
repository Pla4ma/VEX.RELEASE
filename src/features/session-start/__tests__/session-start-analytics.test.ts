/**
 * Tests for session-start analytics.
 */

import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
  trackDifficultyChanged,
  trackInsufficientSessionsForSuggestion,
} from "../analytics";

jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));

describe("session-start: analytics", () => {
  let captureMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    captureMock = require("../../../shared/analytics/analytics-service").capture;
  });

  it("trackDifficultySuggestionShown calls capture with correct event name", () => {
    trackDifficultySuggestionShown("u1", "CASUAL", "FOCUSED", "high");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_shown",
      expect.objectContaining({
        user_id: "u1",
        current_difficulty: "CASUAL",
        suggested_difficulty: "FOCUSED",
        confidence: "high",
      }),
    );
  });

  it("trackDifficultySuggestionAccepted includes stats", () => {
    trackDifficultySuggestionAccepted("u1", "CASUAL", "FOCUSED", {
      sessionsAnalyzed: 10,
      averageGrade: 4.5,
      averagePurity: 88,
    });
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_accepted",
      expect.objectContaining({ sessions_analyzed: 10 }),
    );
  });

  it("trackDifficultySuggestionDismissed captures event", () => {
    trackDifficultySuggestionDismissed("u1", "FOCUSED");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_dismissed",
      expect.objectContaining({ suggested_difficulty: "FOCUSED" }),
    );
  });

  it("trackDifficultyChanged captures source", () => {
    trackDifficultyChanged("u1", "CASUAL", "FOCUSED", "manual");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_changed",
      expect.objectContaining({ source: "manual" }),
    );
  });

  it("trackInsufficientSessionsForSuggestion captures counts", () => {
    trackInsufficientSessionsForSuggestion("u1", 2, 5);
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_insufficient_sessions",
      expect.objectContaining({ sessions_count: 2, required_count: 5 }),
    );
  });
});
