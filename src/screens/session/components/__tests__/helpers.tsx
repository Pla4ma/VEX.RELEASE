import React from "react";
import TestRenderer, {
  type ReactTestRenderer,
  type ReactTestRendererJSON,
} from "react-test-renderer";

import { ActiveSessionHero } from "../ActiveSessionHero";
import type { ActiveSessionHeroViewModel } from "../../utils/active-session-hero-view-model";
import type { ActiveSessionDisplayPolicy } from "../../utils/active-session-display-policy";

jest.mock("../../../../components/primitives/Box", () => {
  const ReactActual = jest.requireActual("react");
  return {
    Box: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement("Box", null, children),
  };
});

jest.mock("../../../../components/primitives/Text", () => {
  const ReactActual = jest.requireActual("react");
  return {
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement("Text", null, children),
  };
});

jest.mock("../../../../icons", () => ({ Icon: () => null }));
jest.mock("../ActiveSessionProgressRing", () => {
  const ReactActual = jest.requireActual("react");
  return {
    ActiveSessionProgressRing: ({
      perfectFocusActive,
      showPurityScore,
    }: {
      perfectFocusActive: boolean;
      showPurityScore: boolean;
    }) =>
      ReactActual.createElement(
        "Text",
        null,
        perfectFocusActive
          ? "Completion Aura"
          : showPurityScore
            ? "Purity Score"
            : "Timer Ring",
      ),
  };
});

export const basePolicy: ActiveSessionDisplayPolicy = {
  heroDensity: "minimal",
  showBossHUD: false,
  showBossTinyIndicator: false,
  showCoachBanner: false,
  showCompanionLayer: false,
  showContractReminder: false,
  showDailyProgress: false,
  showModeOverlay: false,
  showMomentumScore: false,
  showPurityScore: false,
  showStudyTarget: false,
};

export function buildViewModel(
  overrides: Partial<ActiveSessionHeroViewModel> = {},
): ActiveSessionHeroViewModel {
  return {
    phaseIcon: "clock",
    phaseLabel: "Focus",
    phaseAccent: "blue",
    studyTargetLabel: null,
    completionPercentage: 42,
    elapsedSeconds: 120,
    remainingSeconds: 600,
    signalPill: null,
    momentumScores: null,
    dailyProgress: null,
    todayFocusSeconds: null,
    showPurityScore: false,
    perfectFocusActive: false,
    purityScore: 95,
    purityLabel: "Elite",
    streakMultiplier: 1,
    heroDensity: "minimal",
    laneAccent: "quiet_planner",
    secondaryInfo: null,
    isReducedMotion: false,
    ...overrides,
  };
}

export const baseProgressRingProps = {
  CIRCUMFERENCE: 100,
  RADIUS: 40,
  RING_SIZE: 120,
  STROKE_WIDTH: 8,
  animatedCircleProps: {},
  glowStyle: {
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  outerStrokeDashoffset: 0,
  perfectFocusBurst: { value: 0 },
  pulseStyle: {},
  rotatingPerfectFocusStyle: {},
  labelColor: "green",
  withAlpha: (color: string, _alpha?: number) => color,
};

export function renderHero(
  viewModel: ActiveSessionHeroViewModel,
): ReactTestRendererJSON | ReactTestRendererJSON[] | null {
  let renderer: ReactTestRenderer | null = null;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <ActiveSessionHero
        viewModel={viewModel}
        progressRingProps={baseProgressRingProps}
        themeColors={{
          error: "red",
          inverse: "white",
          primary300: "blue",
          success: "green",
          warning: "orange",
        }}
        isReducedMotion={viewModel.isReducedMotion}
      />,
    );
  });
  return (renderer as unknown as ReactTestRenderer | null)?.toJSON() ?? null;
}

export function hasText(
  node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | null,
  text: string,
): boolean {
  if (node === null) {
    return false;
  }
  if (typeof node === "string") {
    return node === text;
  }
  if (Array.isArray(node)) {
    return node.some((child) => hasText(child, text));
  }
  return node.children?.some((child) => hasText(child, text)) ?? false;
}
