import React from "react";
import { render, screen } from "@testing-library/react-native";
import {
  mockState,
  createCommandHomeData,
  resetCommandMocks,
} from "./home-screen-command-helpers";
import { HomeScreen } from "../HomeScreen";

describe("HomeScreen command center", () => {
  beforeEach(() => {
    resetCommandMocks();
  });

  it("keeps the essentials in the first viewport", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Focus Score")).toBeTruthy();
    expect(screen.getByText("Daily Mission")).toBeTruthy();
    expect(screen.getByText("Start Deep Work Plan")).toBeTruthy();
    expect(screen.getByText("6 PM is your best focus window.")).toBeTruthy();
  });

  it("shows study-plan progress without exposing disabled routes", () => {
    mockState.homeData = createCommandHomeData({
      activeStudyPlanQuery: { data: { title: "React Deep Dive" } },
    });

    render(<HomeScreen />);

    expect(screen.getByText('Deep Work Plan: "React Deep Dive"')).toBeTruthy();
    expect(screen.getByText("Start deep work")).toBeTruthy();
    expect(screen.queryByText("Trading")).toBeNull();
    expect(screen.queryByText("Emergency Gem")).toBeNull();
  });

  it("renders loading and offline degraded states", () => {
    mockState.homeData = createCommandHomeData({
      isLoading: true,
      isOnline: false,
    });

    render(<HomeScreen />);

    expect(screen.getByText("Loading home")).toBeTruthy();
    expect(screen.getByText("Offline mode")).toBeTruthy();
  });
});
