import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FocusScoreDashboard } from "../FocusScoreDashboard";
import * as useFocusScore from "../hooks-focus-score";
import * as useNetInfo from "@network";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

jest.mock("../hooks-focus-score");
jest.mock("@network", () => ({
  useNetInfo: jest.fn(() => ({ isOffline: false })),
}));
jest.mock("@hooks", () => ({
  useReducedMotion: jest.fn(() => ({ isReducedMotion: true })),
}));
jest.mock("@components/primitives", () => {
  const React = require("react");
  const { Text: NativeText, View, Pressable } = require("react-native");
  return {
    Box: ({
      children,
      testID,
    }: {
      children?: React.ReactNode;
      testID?: string;
    }) => React.createElement(View, { testID }, children),
    Stack: ({
      children,
      testID,
    }: {
      children?: React.ReactNode;
      testID?: string;
    }) => React.createElement(View, { testID }, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(NativeText, null, children),
    Button: ({
      children,
      onPress,
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
    }) =>
      React.createElement(
        Pressable,
        { onPress },
        React.createElement(NativeText, null, children),
      ),
    Skeleton: ({ testID }: { testID?: string }) =>
      React.createElement(View, { testID }),
  };
});
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("FocusScoreDashboard", () => {
  it("renders loading state", () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "pending",
    });
    const { getByTestId } = render(<FocusScoreDashboard />);
    expect(getByTestId("focus-score-dashboard-skeleton")).toBeTruthy();
  });

  it("renders error state", () => {
    const mockRefetch = jest.fn();
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "error",
      error: { message: "Test Error" },
      refetch: mockRefetch,
    });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText("Error: Test Error")).toBeTruthy();
    const retryButton = getByText("Retry");
    expect(retryButton).toBeTruthy();
    fireEvent.press(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state", () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score: null,
    });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(
      getByText("Start your first session to see your Focus Score."),
    ).toBeTruthy();
  });

  it("renders offline banner when offline", () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score: null,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: true });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText("You are offline. Data may be outdated.")).toBeTruthy();
  });

  it("renders success state with all data", () => {
    const score = {
      currentScore: 750,
      previousScore: 740,
      band: "Elite",
      lastChangeReason: "Great session!",
      factors: {
        consistency: {
          score: 80,
          explanation: "Consistency is a clear strength right now.",
        },
        streakStability: {
          score: 70,
          explanation: "Streak stability is helping your score stay stable.",
        },
        sessionQuality: {
          score: 90,
          explanation: "Session quality is a clear strength right now.",
        },
        intentionalDifficulty: {
          score: 60,
          explanation:
            "Intentional difficulty is helping your score stay stable.",
        },
        recency: {
          score: 85,
          explanation: "Recency is a clear strength right now.",
        },
      },
      topPositiveFactor: "sessionQuality",
      topNegativeFactor: "intentionalDifficulty",
    };
    const history = [
      {
        timestamp: new Date("2026-04-01").toISOString(),
        score: 700,
        delta: 0,
        reason: "",
      },
      {
        timestamp: new Date("2026-04-02").toISOString(),
        score: 710,
        delta: 10,
        reason: "",
      },
    ];
    const mockNavigate = jest.fn();
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score,
      history,
      isRefetching: false,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

    const { getByText, queryByText } = render(<FocusScoreDashboard />);
    expect(getByText("750")).toBeTruthy();
    expect(getByText("Elite")).toBeTruthy();
    expect(getByText("+10 since last session")).toBeTruthy();
    expect(getByText("Great session!")).toBeTruthy();
    expect(
      getByText("Strongest: Session quality is a clear strength right now."),
    ).toBeTruthy();
    expect(
      getByText(
        "Weakest: Intentional difficulty is helping your score stay stable.",
      ),
    ).toBeTruthy();
    expect(getByText("View Monthly Report")).toBeTruthy();
    expect(queryByText("Updating...")).toBeNull(); // Should not be visible when not refetching

    fireEvent.press(getByText("View Monthly Report"));
    expect(mockNavigate).toHaveBeenCalledWith("Analytics", {
      month: new Date().toISOString().slice(0, 7),
    });
  });

  it("renders refetching indicator when refetching", () => {
    const score = {
      currentScore: 750,
      previousScore: 740,
      band: "Elite",
      lastChangeReason: "Great session!",
      factors: {
        consistency: {
          score: 80,
          explanation: "Consistency is a clear strength right now.",
        },
        streakStability: {
          score: 70,
          explanation: "Streak stability is helping your score stay stable.",
        },
        sessionQuality: {
          score: 90,
          explanation: "Session quality is a clear strength right now.",
        },
        intentionalDifficulty: {
          score: 60,
          explanation:
            "Intentional difficulty is helping your score stay stable.",
        },
        recency: {
          score: 85,
          explanation: "Recency is a clear strength right now.",
        },
      },
      topPositiveFactor: "sessionQuality",
      topNegativeFactor: "intentionalDifficulty",
    };
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score,
      isRefetching: true,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText("Updating...")).toBeTruthy();
  });

  it("renders empty history message when no history is available", () => {
    const score = {
      currentScore: 750,
      previousScore: 740,
      band: "Elite",
      lastChangeReason: "Great session!",
      factors: {
        consistency: {
          score: 80,
          explanation: "Consistency is a clear strength right now.",
        },
        streakStability: {
          score: 70,
          explanation: "Streak stability is helping your score stay stable.",
        },
        sessionQuality: {
          score: 90,
          explanation: "Session quality is a clear strength right now.",
        },
        intentionalDifficulty: {
          score: 60,
          explanation:
            "Intentional difficulty is helping your score stay stable.",
        },
        recency: {
          score: 85,
          explanation: "Recency is a clear strength right now.",
        },
      },
      topPositiveFactor: "sessionQuality",
      topNegativeFactor: "intentionalDifficulty",
    };
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score,
      history: [],
      isRefetching: false,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText("No history available yet.")).toBeTruthy();
  });

  it("renders 30-day trend with history data", () => {
    const score = {
      currentScore: 750,
      previousScore: 740,
      band: "Elite",
      lastChangeReason: "Great session!",
      factors: {
        consistency: {
          score: 80,
          explanation: "Consistency is a clear strength right now.",
        },
        streakStability: {
          score: 70,
          explanation: "Streak stability is helping your score stay stable.",
        },
        sessionQuality: {
          score: 90,
          explanation: "Session quality is a clear strength right now.",
        },
        intentionalDifficulty: {
          score: 60,
          explanation:
            "Intentional difficulty is helping your score stay stable.",
        },
        recency: {
          score: 85,
          explanation: "Recency is a clear strength right now.",
        },
      },
      topPositiveFactor: "sessionQuality",
      topNegativeFactor: "intentionalDifficulty",
    };
    const history = [
      {
        timestamp: new Date("2026-04-01").toISOString(),
        score: 700,
        delta: 0,
        reason: "",
      },
      {
        timestamp: new Date("2026-04-02").toISOString(),
        score: 710,
        delta: 10,
        reason: "",
      },
      {
        timestamp: new Date("2026-04-03").toISOString(),
        score: 705,
        delta: -5,
        reason: "",
      },
    ];
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: "success",
      score,
      history,
      isRefetching: false,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText("4/1/2026: 700 (+0)")).toBeTruthy();
    expect(getByText("4/2/2026: 710 (+10)")).toBeTruthy();
    expect(getByText("4/3/2026: 705 (-5)")).toBeTruthy();
  });
});
