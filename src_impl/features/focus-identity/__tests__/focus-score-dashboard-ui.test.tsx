import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FocusScoreDashboard } from "../components/focus-score-dashboard";
import type { FocusScoreDashboardModel } from "../hooks-focus-score";

jest.mock("../../../theme", () => ({
  useTheme: () => ({
    theme: {
      spacing: { 2: 8, 3: 12, 4: 16 },
      borderRadius: { lg: 12, sm: 6 },
      colors: {
        border: { DEFAULT: "#ddd", light: "#ccc" },
        background: { secondary: "#111", tertiary: "#222" },
        text: { primary: "#fff", secondary: "#aaa" },
        primary: { 500: "#5a7" },
      },
    },
  }),
}));

function createModel(overrides: Partial<FocusScoreDashboardModel> = {}): FocusScoreDashboardModel {
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

describe("FocusScoreDashboard UI states", () => {
  it("renders loading skeleton state", () => {
    const screen = render(
      <FocusScoreDashboard
        model={createModel({ isPending: true })}
        onRetry={jest.fn()}
        onStartSession={jest.fn()}
        onOpenMonthlyReport={jest.fn()}
      />,
    );
    expect(screen.queryByText("Focus Score")).toBeNull();
  });

  it("renders error state with retry", () => {
    const screen = render(
      <FocusScoreDashboard
        model={createModel({ isError: true, error: new Error("focus failed") })}
        onRetry={jest.fn()}
        onStartSession={jest.fn()}
        onOpenMonthlyReport={jest.fn()}
      />,
    );
    expect(screen.getByText("Focus Score couldn't load")).toBeTruthy();
  });

  it("renders empty state with CTA", () => {
    const onStartSession = jest.fn();
    const screen = render(
      <FocusScoreDashboard
        model={createModel()}
        onRetry={jest.fn()}
        onStartSession={onStartSession}
        onOpenMonthlyReport={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText("Start session"));
    expect(onStartSession).toHaveBeenCalled();
  });

  it("renders success and monthly report CTA", () => {
    const onOpenMonthlyReport = jest.fn();
    const screen = render(
      <FocusScoreDashboard
        model={createModel({
          current: {
            id: "123e4567-e89b-12d3-a456-426614174111",
            userId: "123e4567-e89b-12d3-a456-426614174000",
            currentScore: 620,
            previousScore: 610,
            band: "Strong",
            factors: {
              consistency: { weightPercent: 35, score: 80, delta: 5, explanation: "Good consistency." },
              streakStability: { weightPercent: 25, score: 70, delta: 2, explanation: "Stable streak." },
              sessionQuality: { weightPercent: 20, score: 88, delta: 4, explanation: "High quality." },
              intentionalDifficulty: { weightPercent: 10, score: 64, delta: 1, explanation: "Balanced challenge." },
              recency: { weightPercent: 10, score: 76, delta: 2, explanation: "Recent sessions." },
            },
            updatedAt: "2026-05-06T10:00:00.000Z",
            createdAt: "2026-05-01T10:00:00.000Z",
            lastChangeReason: "Session completed",
          },
          history: [{ timestamp: "2026-05-06T10:00:00.000Z", score: 620, delta: 10, reason: "Session completed" }],
          monthlyInput: { userId: "123e4567-e89b-12d3-a456-426614174000", month: "2026-05", historyPoints: [], sessionsCompleted: 1, totalFocusedMinutes: 25, bestGrade: "A" },
        })}
        onRetry={jest.fn()}
        onStartSession={jest.fn()}
        onOpenMonthlyReport={onOpenMonthlyReport}
      />,
    );
    expect(screen.getByText("620 · Strong")).toBeTruthy();
    fireEvent.press(screen.getByText("Open monthly report"));
    expect(onOpenMonthlyReport).toHaveBeenCalled();
  });
});
