import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FocusScoreHomeWidget } from "../components/focus-score-home-widget";
import {
  model,
  sampleFocusScore,
  sampleFocusHistory,
} from "./focus-score-home-widget-test-fixtures";

describe("FocusScoreHomeWidget", () => {
  it("renders loading state", () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model({ isPending: true })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByTestId("focus-score-home-widget-skeleton")).toBeTruthy();
  });

  it("renders error state", () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model({ isError: true, error: new Error("err") })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByText("Focus Score is unavailable")).toBeTruthy();
  });

  it("renders honest empty copy for new users", () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model()}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("Focus Score needs three sessions")).toBeTruthy();
    expect(
      screen.getByText(
        "Finish three sessions and VEX will start reading your focus rhythm.",
      ),
    ).toBeTruthy();
  });

  it("renders success and supports tap navigation", () => {
    const onPress = jest.fn();
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          current: sampleFocusScore,
          history: sampleFocusHistory,
        })}
        onPress={onPress}
        onRetry={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByLabelText("Open focus score dashboard"));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText("640 · Strong")).toBeTruthy();
  });

  it("keeps the dashboard tap target at least 44 points tall", () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          current: sampleFocusScore,
        })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Open focus score dashboard").props.style,
    ).toEqual(expect.objectContaining({ minHeight: 44, minWidth: 44 }));
  });

  it("renders offline state", () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          isOffline: true,
          current: sampleFocusScore,
        })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByText("Offline focus mode")).toBeTruthy();
    expect(
      screen.getByText("Cached score shown while VEX waits to sync."),
    ).toBeTruthy();
  });
});
