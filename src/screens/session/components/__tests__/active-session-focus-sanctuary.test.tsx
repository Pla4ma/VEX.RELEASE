import React from 'react';
import TestRenderer, {
  type ReactTestRenderer,
  type ReactTestRendererJSON,
} from 'react-test-renderer';

import { ActiveSessionHero } from '../ActiveSessionHero';
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
    ActiveSessionProgressRing: ({
      perfectFocusActive,
      showPurityScore,
    }: {
      perfectFocusActive: boolean;
      showPurityScore: boolean;
    }) => ReactActual.createElement(
      'Text',
      null,
      perfectFocusActive ? 'Completion Aura' : showPurityScore ? 'Purity Score' : 'Timer Ring',
    ),
  };
});
const basePolicy: ActiveSessionDisplayPolicy = {
  heroDensity: 'minimal',
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

function renderHero(
  displayPolicy: ActiveSessionDisplayPolicy,
  perfectFocusActive = false,
): ReactTestRendererJSON | ReactTestRendererJSON[] | null {
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
        perfectFocusActive={perfectFocusActive}
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
    expect(hasText(hidden, 'Challenge waiting')).toBe(false);
    expect(hasText(hidden, 'Clean focus')).toBe(false);
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
    expect(hasText(visible, 'Challenge waiting')).toBe(true);
    expect(hasText(visible, 'Study target')).toBe(true);
  });

  it('calm active focus renders no signal pill unless necessary', () => {
    const hero = renderHero({
      ...basePolicy,
      heroDensity: 'minimal',
      showBossTinyIndicator: false,
    });
    // minimal density + no boss indicator = no signal pill
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    // perfectFocusActive defaults to false in renderHero
    expect(hasText(hero, 'Clean focus')).toBe(false);
  });

  it('game-like active focus can show tiny boss signal', () => {
    const hero = renderHero({
      ...basePolicy,
      heroDensity: 'minimal',
      showBossTinyIndicator: true,
    });
    expect(hasText(hero, 'Challenge waiting')).toBe(true);
    expect(hasText(hero, 'Clean focus')).toBe(false);
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

  it('completion effects stay hidden when purity HUD is disabled', () => {
    const hero = renderHero(basePolicy, true);
    expect(hasText(hero, 'Completion Aura')).toBe(false);
    expect(hasText(hero, 'Timer Ring')).toBe(true);
  });
});
