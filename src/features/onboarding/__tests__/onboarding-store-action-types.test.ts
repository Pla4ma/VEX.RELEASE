/**
 * Comprehensive Onboarding Feature Tests — Store Action Types
 */

import "./onboarding-mock-setup";

import {
  initialState,
  advanceStepWithCompletionCheck,
} from "../store-action-types";

// ── Store Action Types ────────────────────────────────────────────────────────

describe("Store Action Types", () => {
  describe("initialState", () => {
    it("has all required fields", () => {
      expect(initialState.isOnboarded).toBe(false);
      expect(initialState.currentStep).toBe(0);
      expect(initialState.goal).toBeNull();
      expect(initialState.focusDuration).toBeNull();
      expect(initialState.displayName).toBeNull();
      expect(initialState.startedAt).toBeNull();
      expect(initialState.completedAt).toBeNull();
      expect(initialState.profileStepsCompleted).toBe(false);
      expect(initialState.firstSessionStarted).toBe(false);
      expect(initialState.firstSessionCompleted).toBe(false);
    });
  });

  describe("advanceStepWithCompletionCheck", () => {
    it("advances to target step", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 0 }));
      advanceStepWithCompletionCheck(setMock, getMock, 3);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ currentStep: 3 }),
      );
    });

    it("marks profileStepsCompleted at step 5", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 4 }));
      advanceStepWithCompletionCheck(setMock, getMock, 5);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 5,
          profileStepsCompleted: true,
        }),
      );
    });

    it("does not mark profileStepsCompleted below step 5", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 2 }));
      advanceStepWithCompletionCheck(setMock, getMock, 3);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ currentStep: 3 }),
      );
      const callArgs = setMock.mock.calls[0]![0];
      expect(callArgs.profileStepsCompleted).toBeUndefined();
    });
  });
});
