import { describe, it, expect } from "@jest/globals";
import {
  getCoachPresenceMessageForInterruption,
  getCoachSessionCompletionMessage,
  getCoachStreakMessage,
  getCoachComebackMessage,
} from "../coach-presence-message-resolver";

describe("CoachPresenceMessageResolver", () => {
  describe("interruption messages adapt by motivation style", () => {
    it("calm style avoids pressure on warning", () => {
      const result = getCoachPresenceMessageForInterruption({
        motivationStyle: "CALM",
        firstWeekStage: null,
        sessionState: "risk",
        riskLevel: "warning",
        primaryGoal: "focus",
        studyLayerLabel: null,
        comebackState: null,
        bossIntensity: null,
      });
      expect(result).toContain("no pressure");
    });

    it("intense style avoids shame/cringe on critical", () => {
      const result = getCoachPresenceMessageForInterruption({
        motivationStyle: "INTENSE",
        firstWeekStage: null,
        sessionState: "risk",
        riskLevel: "critical",
        primaryGoal: "work",
        studyLayerLabel: null,
        comebackState: null,
        bossIntensity: null,
      });
      expect(result).not.toContain("failure");
      expect(result).not.toContain("weak");
      expect(result).not.toContain("pathetic");
    });

    it("study style suggests study strategy on interruption", () => {
      const result = getCoachPresenceMessageForInterruption({
        motivationStyle: "STUDY_FOCUSED",
        firstWeekStage: null,
        sessionState: "risk",
        riskLevel: "critical",
        primaryGoal: "study",
        studyLayerLabel: "Study OS",
        comebackState: null,
        bossIntensity: null,
      });
      expect(result).toContain("Review");
    });

    it("returns fallback when context is minimal", () => {
      const result = getCoachPresenceMessageForInterruption({
        motivationStyle: "CALM",
        firstWeekStage: null,
        sessionState: "completed",
        riskLevel: "none",
        primaryGoal: "focus",
        studyLayerLabel: null,
        comebackState: null,
        bossIntensity: null,
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("session completion messages adapt by motivation style", () => {
    it("calm copy avoids pressure for first session", () => {
      const result = getCoachSessionCompletionMessage({
        motivationStyle: "calm",
        isFirstSession: true,
        isComeback: false,
        isStreakRecovery: false,
        sessionMode: "FOCUS",
        durationMinutes: 25,
      });
      expect(result).toContain("First session");
    });

    it("game-like copy uses momentum language", () => {
      const result = getCoachSessionCompletionMessage({
        motivationStyle: "game_like",
        isFirstSession: true,
        isComeback: false,
        isStreakRecovery: false,
        sessionMode: "FOCUS",
        durationMinutes: 25,
      });
      expect(result).toContain("First run");
    });

    it("comeback message is supportive", () => {
      const result = getCoachSessionCompletionMessage({
        motivationStyle: "friendly",
        isFirstSession: false,
        isComeback: true,
        isStreakRecovery: false,
        sessionMode: "FOCUS",
        durationMinutes: 20,
      });
      expect(result).toContain("came back");
    });

    it("long session suggests lighter next move", () => {
      const result = getCoachSessionCompletionMessage({
        motivationStyle: "calm",
        isFirstSession: false,
        isComeback: false,
        isStreakRecovery: false,
        sessionMode: "FOCUS",
        durationMinutes: 50,
      });
      expect(result).toContain("lighter");
    });
  });

  describe("streak messages", () => {
    it("broken streak for calm style avoids pressure", () => {
      const result = getCoachStreakMessage({
        motivationStyle: "calm",
        streak: 7,
        context: "broken",
      });
      expect(result).toContain("No pressure");
    });

    it("streak at risk for intense style is direct but not shame-based", () => {
      const result = getCoachStreakMessage({
        motivationStyle: "intense",
        streak: 5,
        context: "at_risk",
      });
      expect(result).not.toContain("pathetic");
      expect(result).not.toContain("loser");
      expect(result).not.toContain("weak");
    });
  });

  describe("comeback messages", () => {
    it("calm comeback message avoids pressure", () => {
      const result = getCoachComebackMessage({
        motivationStyle: "calm",
        daysSinceLastSession: 3,
      });
      expect(result).toContain("no pressure");
    });

    it("intense comeback message avoids shame", () => {
      const result = getCoachComebackMessage({
        motivationStyle: "intense",
        daysSinceLastSession: 5,
      });
      expect(result).not.toContain("shame");
      expect(result).not.toContain("failure");
    });
  });
});
