import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { HomeScreen } from "../HomeScreen";
import {
  mockState,
  resetRecommendationsMocks,
} from "./home-screen-recommendations-helpers";

describe("HomeScreen recommendations", () => {
  beforeEach(() => {
    resetRecommendationsMocks();
  });

  it("accepts a recommendation and routes into session setup", async () => {
    mockState.updateRecommendationStatus.mockResolvedValue(undefined);

    render(<HomeScreen />);
    fireEvent.press(screen.getByText("Accept suggestion"));

    await waitFor(() => {
      expect(mockState.updateRecommendationStatus).toHaveBeenCalledWith({
        recommendationId: "rec-1",
        status: "ACCEPTED",
        userId: "user-1",
      });
      expect(mockState.navigate).toHaveBeenCalledWith("SessionStack", {
        screen: "SessionSetup",
        params: {
          recommendationId: "rec-1",
          suggestedDifficulty: "NORMAL",
          suggestedDurationSeconds: 1800,
        },
      });
    });
  });

  it("dismisses a recommendation as rejected", async () => {
    mockState.updateRecommendationStatus.mockResolvedValue(undefined);

    render(<HomeScreen />);
    fireEvent.press(screen.getByText("Dismiss suggestion"));

    await waitFor(() => {
      expect(mockState.updateRecommendationStatus).toHaveBeenCalledWith({
        recommendationId: "rec-1",
        status: "REJECTED",
        userId: "user-1",
      });
    });
  });
});
