import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { evaluateInterventions } from "../../services/intervention-engine";
import * as repository from "../../repository";
import {
  createMockCoachState,
  createMockInterventionRule,
  mockUserId,
} from "./helpers";

jest.mock("../../repository");

describe("Intervention Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("evaluateInterventions", () => {
    it("executes applicable rules", async () => {
      const mockRule = createMockInterventionRule({
        name: "Streak Risk Alert",
        conditions: [{ field: "streakDays", operator: "gt", value: 3 }],
      });
      (
        repository.fetchInterventionRulesByTrigger as jest.Mock
      ).mockResolvedValue([mockRule]);
      (repository.wasRuleTriggeredRecently as jest.Mock).mockResolvedValue(
        false,
      );
      (
        repository.fetchTodaysInterventionExecutions as jest.Mock
      ).mockResolvedValue([]);
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(
        createMockCoachState({
          currentState: "HIGH_CONFIDENCE",
          muteUntil: null,
          reduceNotifications: false,
          interventionsToday: 0,
        }),
      );
      const executions = await evaluateInterventions(
        mockUserId,
        "STREAK_AT_RISK",
        { streakDays: 5, hoursSinceLastSession: 30 },
      );
      expect(executions.length).toBeGreaterThan(0);
    });

    it("respects daily intervention limits", async () => {
      (
        repository.fetchTodaysInterventionExecutions as jest.Mock
      ).mockResolvedValue(
        Array(5).fill({ id: "exec-1", ruleId: "rule-1" }),
      );
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(
        createMockCoachState({
          currentState: "HIGH_CONFIDENCE",
          muteUntil: null,
          reduceNotifications: false,
          interventionsToday: 5,
        }),
      );
      const executions = await evaluateInterventions(
        mockUserId,
        "STREAK_AT_RISK",
        {},
      );
      expect(executions).toHaveLength(0);
    });

    it("respects cooldown periods", async () => {
      const mockRule = createMockInterventionRule({ name: "Frequent Rule" });
      (
        repository.fetchInterventionRulesByTrigger as jest.Mock
      ).mockResolvedValue([mockRule]);
      (repository.wasRuleTriggeredRecently as jest.Mock).mockResolvedValue(
        true,
      );
      (
        repository.fetchTodaysInterventionExecutions as jest.Mock
      ).mockResolvedValue([]);
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(
        createMockCoachState({
          currentState: "HIGH_CONFIDENCE",
          muteUntil: null,
          reduceNotifications: false,
          interventionsToday: 0,
        }),
      );
      const executions = await evaluateInterventions(
        mockUserId,
        "STREAK_AT_RISK",
        {},
      );
      expect(executions).toHaveLength(0);
    });

    it("filters out disabled rules", async () => {
      const disabledRule = createMockInterventionRule({
        name: "Disabled Rule",
        enabled: false,
      });
      (
        repository.fetchInterventionRulesByTrigger as jest.Mock
      ).mockResolvedValue([disabledRule]);
      (
        repository.fetchTodaysInterventionExecutions as jest.Mock
      ).mockResolvedValue([]);
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(
        createMockCoachState({
          currentState: "HIGH_CONFIDENCE",
          muteUntil: null,
          reduceNotifications: false,
          interventionsToday: 0,
        }),
      );
      const executions = await evaluateInterventions(
        mockUserId,
        "STREAK_AT_RISK",
        {},
      );
      expect(executions).toHaveLength(0);
    });
  });
});
