/**
 * Paywall State Machine — helper function tests
 */
import {
  canDismissPaywall,
  canPurchase,
  createInitialState,
  getPaywallStateMessage,
  getRetryAction,
  isTerminalState,
  type PaywallContext,
} from "../paywall-state-machine";

describe("Paywall State Machine — helpers", () => {
  const mockContext: PaywallContext = {
    userId: "user-1",
    currentTier: "free",
    sessionsCompleted: 10,
  };

  describe("getPaywallStateMessage", () => {
    it("returns message for each state", () => {
      expect(getPaywallStateMessage("idle")).toBe("");
      expect(getPaywallStateMessage("loading")).toContain("Loading");
      expect(getPaywallStateMessage("presenting")).toContain("Choose");
      expect(getPaywallStateMessage("purchasing")).toContain("Processing");
      expect(getPaywallStateMessage("success")).toContain("Welcome");
      expect(getPaywallStateMessage("failed")).toContain("wrong");
      expect(getPaywallStateMessage("trial_started")).toContain("trial");
      expect(getPaywallStateMessage("restoring")).toContain("Restoring");
      expect(getPaywallStateMessage("dismissed")).toContain("later");
    });
  });

  describe("canDismissPaywall", () => {
    it("returns true for presenting", () => {
      expect(canDismissPaywall("presenting")).toBe(true);
    });

    it("returns true for failed", () => {
      expect(canDismissPaywall("failed")).toBe(true);
    });

    it("returns false for other states", () => {
      expect(canDismissPaywall("idle")).toBe(false);
      expect(canDismissPaywall("purchasing")).toBe(false);
      expect(canDismissPaywall("success")).toBe(false);
    });
  });

  describe("canPurchase", () => {
    it("returns true for presenting", () => {
      expect(canPurchase("presenting")).toBe(true);
    });

    it("returns true for failed", () => {
      expect(canPurchase("failed")).toBe(true);
    });

    it("returns true for trial_started", () => {
      expect(canPurchase("trial_started")).toBe(true);
    });

    it("returns false for other states", () => {
      expect(canPurchase("idle")).toBe(false);
      expect(canPurchase("success")).toBe(false);
    });
  });

  describe("isTerminalState", () => {
    it("returns true for success", () => {
      expect(isTerminalState("success")).toBe(true);
    });

    it("returns true for dismissed", () => {
      expect(isTerminalState("dismissed")).toBe(true);
    });

    it("returns false for other states", () => {
      expect(isTerminalState("presenting")).toBe(false);
      expect(isTerminalState("purchasing")).toBe(false);
      expect(isTerminalState("failed")).toBe(false);
    });
  });

  describe("getRetryAction", () => {
    it("returns purchase action when tier selected", () => {
      const failed = {
        state: "failed" as const,
        context: { ...mockContext, selectedTier: "plus" },
        canDismiss: true,
        canRestore: true,
      };
      const action = getRetryAction(failed);
      expect(action).toEqual({ type: "PURCHASE", tier: "plus" });
    });

    it("returns restore action when no tier selected", () => {
      const failed = {
        state: "failed" as const,
        context: mockContext,
        canDismiss: true,
        canRestore: true,
      };
      const action = getRetryAction(failed);
      expect(action).toEqual({ type: "RESTORE" });
    });

    it("returns null for non-failed state", () => {
      const presenting = {
        state: "presenting" as const,
        context: mockContext,
        canDismiss: true,
        canRestore: true,
      };
      expect(getRetryAction(presenting)).toBeNull();
    });
  });
});
