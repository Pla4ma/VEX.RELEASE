import React from "react";
import renderer, { act } from "react-test-renderer";

import { LauncherStep } from "../LauncherStep";

jest.mock("react-native", () => {
  const ReactRuntime = require("react");
  const createComponent =
    (name: string) =>
    ({ children, ...props }: React.PropsWithChildren<object>) =>
      ReactRuntime.createElement(name, props, children);

  return {
    Pressable: createComponent("Pressable"),
    Text: createComponent("Text"),
    View: createComponent("View"),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock("expo-linear-gradient", () => {
  const ReactRuntime = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: React.PropsWithChildren) =>
      ReactRuntime.createElement(View, null, children),
  };
});

jest.mock("react-native-reanimated", () => {
  const ReactRuntime = require("react");
  const { View } = require("react-native");
  const AnimatedView = ({
    children,
    ...props
  }: React.PropsWithChildren<object>) =>
    ReactRuntime.createElement(View, props, children);
  return {
    __esModule: true,
    default: { View: AnimatedView },
    FadeInDown: {
      delay: () => ({ duration: () => undefined }),
      duration: () => undefined,
    },
    FadeInUp: {
      delay: () => ({ duration: () => undefined }),
      duration: () => undefined,
    },
  };
});

jest.mock("../../../../theme", () => ({
  useTheme: () => ({
    theme: {
      borderRadius: { "3xl": 24 },
      colors: {
        background: { secondary: "#ffffff" },
        border: { DEFAULT: "#dddddd" },
        text: { inverse: "#ffffff", primary: "#111111", secondary: "#666666" },
      },
      spacing: { 4: 16, 5: 20, 6: 24 },
    },
  }),
}));

jest.mock("../../../../hooks/useReducedMotion", () => ({
  useReducedMotion: () => ({ isReducedMotion: false }),
}));

jest.mock("../../../home/HomeScreenVisuals", () => ({
  getHeroGradientColors: () => ["#111111", "#222222"],
}));

jest.mock("../../../../components/primitives/Button", () => {
  const ReactRuntime = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({
      children,
      onPress,
    }: React.PropsWithChildren<{ onPress?: () => void }>) =>
      ReactRuntime.createElement(
        Pressable,
        { onPress },
        ReactRuntime.createElement(Text, null, children),
      ),
  };
});

jest.mock("../../../../components/primitives/Text", () => {
  const ReactRuntime = require("react");
  const { Text } = require("react-native");
  return {
    Text: ({ children, ...props }: React.PropsWithChildren<object>) =>
      ReactRuntime.createElement(Text, props, children),
  };
});

function textFromChildren(children: unknown): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }
  return "";
}

describe("LauncherStep", () => {
  it("does not let users finish onboarding before the starter session proves value", () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <LauncherStep
          firstSessionXp={50}
          hasSeenFirstWin={false}
          isFinishing={false}
          isLaunchingSession={false}
          onFinishOnboarding={jest.fn()}
          onStartFirstSession={jest.fn()}
          selectedPreset={{
            durationLabel: "15 min",
            id: "quick",
            launchDescription: "A small win that starts the loop.",
            title: "First focused win",
          }}
        />,
      );
    });

    const textNodes = tree?.root.findAll(
      (node) =>
        textFromChildren(node.props.children) === "Skip first session for now",
    );
    expect(textNodes).toHaveLength(0);
  });
});
