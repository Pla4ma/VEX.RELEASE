import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FocusScoreHomeWidget } from "../components/focus-score-home-widget";
import type { FocusScoreDashboardModel } from "../hooks-focus-score";

jest.mock("../../../theme", () => ({
  useTheme: () => ({
    theme: {
      spacing: { 1: 4, 2: 8, 4: 16 },
      borderRadius: { lg: 12 },
      colors: {
        border: { light: "#ccc" },
        background: { secondary: "#111" },
        text: { primary: "#fff", secondary: "#aaa" },
      },
    },
  }),
}));

function model(overrides: Partial<FocusScoreDashboardModel> = {}): FocusScoreDashboardModel {
  return {
    current: null,
    history: [],
    monthlyInput: null,
    isOffline: false,
    isPending: false,
    isError: false,
    error: null,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe("FocusScoreHomeWidget", () => {
  it("renders loading state", () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isPending: true })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByTestId("focus-score-home-widget-skeleton")).toBeTruthy();
  });

  it("renders error state", () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isError: true, error: new Error("err") })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByText("Focus Score is unavailable")).toBeTruthy();
  });

  it("renders success and supports tap navigation", () => {
    const onPress = jest.fn();
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          current: {
            id: "123e4567-e89b-12d3-a456-426614174111",
            userId: "123e4567-e89b-12d3-a456-426614174000",
            currentScore: 640,
            previousScore: 630,
            band: "Strong",
            factors: {
              consistency: { weightPercent: 35, score: 82, delta: 5, explanation: "Good consistency." },
              streakStability: { weightPercent: 25, score: 72, delta: 2, explanation: "Stable streak." },
              sessionQuality: { weightPercent: 20, score: 87, delta: 4, explanation: "Quality up." },
              intentionalDifficulty: { weightPercent: 10, score: 61, delta: 1, explanation: "Balanced challenge." },
              recency: { weightPercent: 10, score: 78, delta: 2, explanation: "Recent sessions." },
            },
            updatedAt: "2026-05-06T10:00:00.000Z",
            createdAt: "2026-05-01T10:00:00.000Z",
            lastChangeReason: "Session quality improved",
          },
          history: [{ timestamp: "2026-05-06T10:00:00.000Z", score: 640, delta: 10, reason: "Quality improved" }],
        })}
        onPress={onPress}
        onRetry={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByLabelText("Open focus score dashboard"));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText("640 · Strong")).toBeTruthy();
  });

  it("renders offline state", () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isOffline: true, current: {
      id: "123e4567-e89b-12d3-a456-426614174111",
      userId: "123e4567-e89b-12d3-a456-426614174000",
      currentScore: 640,
      previousScore: 630,
      band: "Strong",
      factors: {
        consistency: { weightPercent: 35, score: 82, delta: 5, explanation: "Good consistency." },
        streakStability: { weightPercent: 25, score: 72, delta: 2, explanation: "Stable streak." },
        sessionQuality: { weightPercent: 20, score: 87, delta: 4, explanation: "Quality up." },
        intentionalDifficulty: { weightPercent: 10, score: 61, delta: 1, explanation: "Balanced challenge." },
        recency: { weightPercent: 10, score: 78, delta: 2, explanation: "Recent sessions." },
      },
      updatedAt: "2026-05-06T10:00:00.000Z",
      createdAt: "2026-05-01T10:00:00.000Z",
      lastChangeReason: "Session quality improved",
    } })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByText("Offline focus mode")).toBeTruthy();
    expect(screen.getByText("Cached score shown while VEX waits to sync.")).toBeTruthy();
  });
});
