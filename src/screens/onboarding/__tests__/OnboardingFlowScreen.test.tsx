import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";

import "./OnboardingFlowScreen.test.mocks";
import { OnboardingFlowScreen } from "../OnboardingFlowScreen";
import { useDisclosureAnalytics } from "../../../features/liveops-config";
import { useSessionHistory } from "../../../session/hooks/useSession";
import { useOnboardingStore } from "../../../onboarding";
import { useAuthStore } from "../../../store";
import {
  mockNavigate,
  mockReplace,
  mockCompleteOnboarding,
  mockSaveDraft,
  mockTrackFirstSessionStarted,
  mockTrackGoalSet,
  mockTrackOnboardingCompleted,
  mockTrackOnboardingStarted,
} from "./OnboardingFlowScreen.test.mocks";

const mockedUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockedUseDisclosureAnalytics =
  useDisclosureAnalytics as jest.MockedFunction<typeof useDisclosureAnalytics>;
const mockedUseOnboardingStore = useOnboardingStore as jest.MockedFunction<
  typeof useOnboardingStore
>;
const mockedUseSessionHistory = useSessionHistory as jest.MockedFunction<
  typeof useSessionHistory
>;

function textFromChildren(children: unknown): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }

  return "";
}

function pressByText(root: ReactTestInstance, label: string): void {
  const target = root
    .findAllByType(Pressable)
    .find((pressable) =>
      pressable
        .findAllByType(Text)
        .some(
          (textNode) => textFromChildren(textNode.props.children) === label,
        ),
    );

  if (!target || typeof target.props.onPress !== "function") {
    throw new Error(`Missing pressable text: ${label}`);
  }

  act(() => {
    target.props.onPress();
  });
}

describe("OnboardingFlowScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({ user: { id: "user-1" } } as ReturnType<
      typeof useAuthStore
    >);
    mockedUseSessionHistory.mockReturnValue({ history: [] } as ReturnType<
      typeof useSessionHistory
    >);
    mockedUseDisclosureAnalytics.mockReturnValue({
      trackFirstSessionStarted: mockTrackFirstSessionStarted,
      trackOnboardingCompleted: mockTrackOnboardingCompleted,
      trackOnboardingFirstSessionCompleted: jest.fn(),
      trackOnboardingGoalSet: mockTrackGoalSet,
      trackOnboardingStarted: mockTrackOnboardingStarted,
    } as ReturnType<typeof useDisclosureAnalytics>);
    mockedUseOnboardingStore.mockImplementation((selector) =>
      selector({
        completeOnboarding: mockCompleteOnboarding,
        getDraft: () => undefined,
        saveDraft: mockSaveDraft,
      } as Parameters<typeof selector>[0]),
    );
  });

  it("sends a new user to a first session quickly", () => {
    const tree = renderer.create(<OnboardingFlowScreen />);

    pressByText(tree.root, "Build consistency");
    pressByText(tree.root, "Continue");
    pressByText(tree.root, "Continue");
    pressByText(tree.root, "Start 15 min Session");

    expect(mockTrackGoalSet).toHaveBeenCalledWith(
      "user-1",
      "build_consistency",
    );
    expect(mockTrackFirstSessionStarted).toHaveBeenCalledWith(
      "user-1",
      "onboarding",
    );
    expect(mockNavigate).toHaveBeenCalledWith("SessionStack", {
      screen: "SessionSetup",
      params: {
        goal: "Build consistency",
        presetId: "quick",
        source: "onboarding_first_session",
      },
    });
  });

  it("does not expose a no-proof exit before the first session is completed", () => {
    const tree = renderer.create(<OnboardingFlowScreen />);

    pressByText(tree.root, "Build consistency");
    pressByText(tree.root, "Continue");
    pressByText(tree.root, "Continue");

    const skipControls = tree.root
      .findAllByType(Text)
      .filter(
        (node) =>
          textFromChildren(node.props.children) ===
          "Skip first session for now",
      );
    expect(skipControls).toHaveLength(0);
    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
