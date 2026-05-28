import { describe, it, expect, beforeEach } from "@jest/globals";
import { screen } from "@testing-library/react-native";
import {
  resetFeatureMocks,
  renderGuardedFeature,
  mockIsFeatureEnabled,
  mockIsFeatureDisabled,
  mockIsFeatureOptional,
  mockGetDisabledFeatures,
} from "./test-helpers";

describe("Navigation Guard - Restrictions & Compliance", () => {
  beforeEach(() => {
    resetFeatureMocks();
  });

  describe("Disabled Features Verification", () => {
    it("should block all explicitly disabled features", () => {
      const disabledFeatures = mockGetDisabledFeatures();
      disabledFeatures.forEach((feature: string) => {
        mockIsFeatureDisabled.mockReturnValue(true);
        renderGuardedFeature(feature);
        expect(screen.queryByTestId("protected-content")).toBeFalsy();
        expect(
          screen.getByText("This feature is currently disabled"),
        ).toBeTruthy();
      });
    });
    it("should verify banned features are properly blocked", () => {
      const bannedFeatures = [
        "social-feed",
        "duels",
        "rankings",
        "squad-wars",
        "rivals",
        "trading",
      ];
      bannedFeatures.forEach((feature: string) => {
        mockIsFeatureDisabled.mockReturnValue(true);
        renderGuardedFeature(feature);
        expect(screen.queryByTestId("protected-content")).toBeFalsy();
      });
    });
  });

  describe("Core Features Access", () => {
    it("should allow access to all core features", () => {
      const coreFeatures = [
        "sessions",
        "focus-timer",
        "streaks",
        "rewards",
        "progression",
      ];
      coreFeatures.forEach((feature: string) => {
        mockIsFeatureEnabled.mockReturnValue(true);
        renderGuardedFeature(feature);
        expect(screen.getByTestId("protected-content")).toBeTruthy();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown features gracefully", () => {
      renderGuardedFeature("unknown-feature");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(screen.getByText("Feature not available")).toBeTruthy();
    });
    it("should handle feature flag errors gracefully", () => {
      mockIsFeatureEnabled.mockImplementation(() => {
        throw new Error("Feature flag error");
      });
      renderGuardedFeature("sessions");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(screen.getByText("Feature not available")).toBeTruthy();
    });
  });

  describe("PHASE 8 Compliance", () => {
    it("should ensure navigation respects PHASE 8 feature configuration", () => {
      const testFeatures = {
        enabled: ["sessions", "focus-timer", "streaks"],
        optional: ["boss", "challenges", "squads"],
        disabled: ["social-feed", "duels", "rankings"],
      };
      Object.entries(testFeatures).forEach(([category, features]) => {
        features.forEach((feature: string) => {
          if (category === "enabled") {
            mockIsFeatureEnabled.mockReturnValue(true);
          } else if (category === "disabled") {
            mockIsFeatureDisabled.mockReturnValue(true);
          } else {
            mockIsFeatureOptional.mockReturnValue(true);
          }
          renderGuardedFeature(feature);
          if (category === "enabled") {
            expect(screen.getByTestId("protected-content")).toBeTruthy();
          } else {
            expect(screen.queryByTestId("protected-content")).toBeFalsy();
            expect(
              screen.getByText(
                /Feature (not available|currently disabled|not yet available)/,
              ),
            ).toBeTruthy();
          }
        });
      });
    });
    it("should prevent navigation to experimental features", () => {
      mockIsFeatureDisabled.mockReturnValue(true);
      renderGuardedFeature("ar-experimental");
      expect(screen.queryByTestId("protected-content")).toBeFalsy();
      expect(
        screen.getByText("This feature is currently disabled"),
      ).toBeTruthy();
    });
  });
});
