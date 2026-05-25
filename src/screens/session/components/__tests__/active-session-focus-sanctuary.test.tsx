import React from 'react';
import TestRenderer, {
  type ReactTestRenderer,
  type ReactTestRendererJSON,
} from 'react-test-renderer';

import { SessionMode } from '../../../../session/modes';
import { ActiveSessionHero } from '../ActiveSessionHero';
import { ActiveSessionModeOverlays } from '../ActiveSessionModeOverlays';
import { resolveActiveSessionDisplayPolicy } from '../../utils/active-session-display-policy';
import type { ActiveSessionDisplayPolicy } from '../../utils/active-session-display-policy';

jest.mock('../../../../components/primitives/Box', () => {
  const ReactActual = jest.requireActual('react');
  return { Box: ({ children }: { children?: React.ReactNode }) => ReactActual.createElement('Box', null, children) };
});

jest.mock('../../../../components/primitives/Text', () => {
  const ReactActual = jest.requireActual('react');
  return { Text: ({ children }: { children?: React.ReactNode }) => ReactActual.createElement('Text', null, children) };
});

jest.mock('../../../../icons', () => ({ Icon: () => null }));
jest.mock('../ActiveSessionProgressRing', () => {
  const ReactActual = jest.requireActual('react');
  return {
    ActiveSessionProgressRing: ({ showPurityScore }: { showPurityScore: boolean }) =>
      ReactActual.createElement('Text', null, showPurityScore ? 'Purity Score' : 'Timer Ring'),
  };
});
jest.mock('../../../../features/session/StudyQuizBreak', () => ({ StudyQuizBreak: () => null }));
jest.mock('../../../../session/components/CreativeMoodLogger', () => ({ CreativeMoodLogger: () => null }));
jest.mock('../../../../session/components/ModeIndicatorBadge', () => {
  const ReactActual = jest.requireActual('react');
  return { ModeIndicatorBadge: () => ReactActual.createElement('Text', null, 'Mode Overlay') };
});

const basePolicy: ActiveSessionDisplayPolicy = {
  heroDensity: 'minimal',
  showBossHUD: false,
  showBossTinyIndicator: false,
  showCoachBanner: false,
  showCompanionLayer: true,
  showContractReminder: false,
  showDailyProgress: false,
  showModeOverlay: false,
  showMomentumScore: false,
  showPurityScore: false,
  showStudyTarget: false,
};

function renderHero(displayPolicy: ActiveSessionDisplayPolicy): ReactTestRendererJSON | ReactTestRendererJSON[] | null {
  let renderer: ReactTestRenderer | null = null;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <ActiveSessionHero
        CIRCUMFERENCE={100}
        RADIUS={40}
        RING_SIZE={120}
        STROKE_WIDTH={8}
        animatedCircleProps={{}}
        completionPercentage={42}
        dailyProgress={50}
        displayPolicy={displayPolicy}
        elapsedSeconds={120}
        glowStyle={{ elevation: 0, shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0 }}
        labelColor="green"
        momentumScores={[]}
        outerStrokeDashoffset={0}
        perfectFocusActive={false}
        perfectFocusBurst={{ value: 0 }}
        phaseAccent="blue"
        phaseIcon="clock"
        phaseLabel="Focus"
        pulseStyle={{}}
        purityLabel="Clean"
        purityScore={95}
        remainingSeconds={600}
        rotatingPerfectFocusStyle={{}}
        streakMultiplier={1}
        studyTargetLabel="Study target"
        themeColors={{ error: 'red', inverse: 'white', primary300: 'blue', success: 'green', warning: 'orange' }}
        todayFocusSeconds={3600}
        withAlpha={(color) => color}
      />,
    );
  });
  return renderer?.toJSON() ?? null;
}

function hasText(
  node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | null,
  text: string,
): boolean {
  if (node === null) {
    return false;
  }
  if (typeof node === 'string') {
    return node === text;
  }
  if (Array.isArray(node)) {
    return node.some((child) => hasText(child, text));
  }
  return node.children?.some((child) => hasText(child, text)) ?? false;
}

describe('active session focus sanctuary components', () => {
  it('ActiveSessionHero respects every displayPolicy flag', () => {
    const hidden = renderHero(basePolicy);
    expect(hasText(hidden, 'Purity Score')).toBe(false);
    expect(hasText(hidden, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hidden, '60:00 today - 50% of 2h goal')).toBe(false);
    expect(hasText(hidden, 'Boss pressure banked for completion')).toBe(false);
    expect(hasText(hidden, 'Boss awaits completion')).toBe(false);
    expect(hasText(hidden, 'Perfect Focus')).toBe(false);
    expect(hasText(hidden, 'Study target')).toBe(false);

    const visible = renderHero({
      ...basePolicy,
      heroDensity: 'standard',
      showBossTinyIndicator: true,
      showDailyProgress: true,
      showMomentumScore: true,
      showPurityScore: true,
      showStudyTarget: true,
    });
    expect(hasText(visible, 'Purity Score')).toBe(true);
    expect(hasText(visible, 'Calibrating momentum...')).toBe(true);
    expect(hasText(visible, '60:00 today - 50% of 2h goal')).toBe(true);
    expect(hasText(visible, 'Boss awaits completion')).toBe(true);
    expect(hasText(visible, 'Study target')).toBe(true);
  });

  it('calm active focus renders no signal pill unless necessary', () => {
    const hero = renderHero({
      ...basePolicy,
      heroDensity: 'minimal',
      showBossTinyIndicator: false,
    });
    // minimal density + no boss indicator = no signal pill
    expect(hasText(hero, 'Boss awaits completion')).toBe(false);
    // perfectFocusActive defaults to false in renderHero
    expect(hasText(hero, 'Perfect Focus')).toBe(false);
  });

  it('game-like active focus can show tiny boss signal', () => {
    const hero = renderHero({
      ...basePolicy,
      heroDensity: 'minimal',
      showBossTinyIndicator: true,
    });
    expect(hasText(hero, 'Boss awaits completion')).toBe(true);
    expect(hasText(hero, 'Perfect Focus')).toBe(false);
  });

  it('study active focus shows study target', () => {
    const hero = renderHero({
      ...basePolicy,
      showStudyTarget: true,
    });
    expect(hasText(hero, 'Study target')).toBe(true);
  });

  it('daily progress hidden during active focus', () => {
    const hero = renderHero({
      ...basePolicy,
      showDailyProgress: false,
    });
    expect(hasText(hero, '60:00 today - 50% of 2h goal')).toBe(false);
  });

  it('momentum dots hidden during active focus', () => {
    const hero = renderHero({
      ...basePolicy,
      showMomentumScore: false,
    });
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
  });

  it('overlays hidden unless opted in or paused', () => {
    let renderer: ReactTestRenderer | null = null;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ActiveSessionModeOverlays
          allowStudyQuizBreak={false}
          chainCount={0}
          completionPercentage={50}
          currentMode={SessionMode.FLOW}
          displayPolicy={{ ...basePolicy, showModeOverlay: false }}
          isPaused={false}
          quizBreakKey={null}
          remainingSeconds={600}
          studyPlanId={undefined}
          onCloseQuiz={() => undefined}
          onSkipQuiz={() => undefined}
        />,
      );
    });
    const result = renderer?.toJSON() ?? null;
    expect(hasText(result, 'Mode Overlay')).toBe(false);
  });

  it('coach banner structural gate kept in display policy test suite', () => {
    const calmActive = {
      focusStage: 'active' as const,
      motivationStyle: 'coach_led' as const,
      primaryGoal: 'work' as const,
      sessionMode: SessionMode.FLOW,
    };
    const policy = resolveActiveSessionDisplayPolicy(calmActive);
    expect(policy.showCoachBanner).toBe(false);
  });

  it('ActiveSessionModeOverlays refuses stacked focus overlays when policy hides them', () => {
    let renderer: ReactTestRenderer | null = null;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ActiveSessionModeOverlays
          allowStudyQuizBreak
          chainCount={2}
          completionPercentage={60}
          currentMode={SessionMode.FLOW}
          displayPolicy={basePolicy}
          isPaused
          quizBreakKey="quiz"
          remainingSeconds={300}
          studyPlanId="study"
          onCloseQuiz={() => undefined}
          onSkipQuiz={() => undefined}
        />,
      );
    });
    const result = renderer?.toJSON() ?? null;
    expect(hasText(result, 'Mode Overlay')).toBe(false);
  });
});
