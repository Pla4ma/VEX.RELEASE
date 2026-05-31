import { describe, expect, it } from '@jest/globals';

import { buildFeatureAccess } from '../../../features/liveops-config/feature-access';
import type { FeatureKey } from '../../../features/liveops-config/feature-access';
import { getFeatureAvailability } from '../../../features/liveops-config/feature-availability';
import { getBossScreenCopy } from '../BossScreenSections';
import { isFeatureHidden } from '../../../features/liveops-config/final-release-feature-map';

function resolveBossIntensity(style: string | null): string {
  switch (style) {
    case 'game_like':
    case 'competitive':
      return 'game-like';
    case 'intense':
      return 'intense';
    default:
      return 'subtle';
  }
}

describe('BossScreen progressive unlock', () => {
  it('locked boss cannot query or navigate', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 0 });
    const availability = getFeatureAvailability(features.features.boss_tab);

    expect(availability.canQuery).toBe(false);
    expect(availability.canUseBackend).toBe(false);
    expect(availability.canNavigate).toBe(false);
  });

  it('degraded boss reports degraded availability', () => {
    const features = buildFeatureAccess({
      degradedFeatures: new Set<FeatureKey>(['boss_tab']),
      totalCompletedSessions: 20,
    });

    expect(getFeatureAvailability(features.features.boss_tab).state).toBe(
      'degraded',
    );
  });

  it('maps motivation styles to final release boss intensity', () => {
    expect(resolveBossIntensity('calm')).toBe('subtle');
    expect(resolveBossIntensity('friendly')).toBe('subtle');
    expect(resolveBossIntensity('study_focused')).toBe('subtle');
    expect(resolveBossIntensity('game_like')).toBe('game-like');
    expect(resolveBossIntensity('intense')).toBe('intense');
  });

  it('does not expose squads when squad feature is disabled', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 10 });
    const availability = getFeatureAvailability(features.features.squads);

    expect(availability.canQuery).toBe(false);
    expect(availability.canRenderEntryPoint).toBe(false);
  });

  it('uses subtle momentum copy for calm users', () => {
    const subtleCopy = getBossScreenCopy('subtle');

    expect(subtleCopy.title).toContain('Focus');
    expect(subtleCopy.title).not.toContain('Battle');
    expect(subtleCopy.intro).not.toMatch(/damage|attack|combat/i);
  });

  it('uses boss health copy only for game-like or intense users', () => {
    expect(getBossScreenCopy('game-like').title).toContain('Boss');
    expect(getBossScreenCopy('intense').intro).toContain(
      'work stays the center',
    );
  });
});

describe('Final Release boss squad/community removal', () => {
  it('squads are hidden in final release feature map', () => {
    expect(isFeatureHidden('squads')).toBe(true);
  });

  it('boss_bounties are hidden in final release', () => {
    expect(isFeatureHidden('boss_bounties')).toBe(true);
  });

  it('boss_tab is progressive (not hidden) in final release', () => {
    expect(isFeatureHidden('boss_tab')).toBe(false);
  });

  it('shop, inventory, economy_advanced are hidden in final release', () => {
    expect(isFeatureHidden('shop')).toBe(true);
    expect(isFeatureHidden('inventory')).toBe(true);
    expect(isFeatureHidden('economy_advanced')).toBe(true);
  });
});

describe('Boss intensity based on user motivation and behavior', () => {
  it('calm user renders subtle momentum language', () => {
    const copy = getBossScreenCopy('subtle');
    expect(copy.actionLabel).toBe('Start focus block');
    expect(copy.metricLabel).toBe('Momentum earned');
  });

  it('game-like user renders boss health language', () => {
    const copy = getBossScreenCopy('game-like');
    expect(copy.metricLabel).toBe('Total damage');
    expect(copy.title).toBe('Boss Health');
  });

  it('intense user renders full boss language', () => {
    const copy = getBossScreenCopy('intense');
    expect(copy.actionLabel).toBe('Start focused push');
    expect(copy.title).toBe('Boss Focus');
  });

  it('degraded boss with ignored feature lowers availability', () => {
    const features = buildFeatureAccess({
      degradedFeatures: new Set<FeatureKey>(['boss_tab']),
      totalCompletedSessions: 15,
    });
    const availability = getFeatureAvailability(features.features.boss_tab);

    expect(availability.canNavigate).toBe(false);
    expect(availability.canQuery).toBe(false);
  });

  it('study-heavy user copy emphasizes focus over boss combat', () => {
    const subtleCopy = getBossScreenCopy('subtle');
    expect(subtleCopy.intro).toContain('moves this marker forward');
    expect(subtleCopy.intro).not.toMatch(/damage|attack|combat|health/i);
  });
});

describe('BossScreen personal boss focus (no squad)', () => {
  it('boss damage calculation uses streak multiplier', () => {
    const { estimateDamage } = require('../BossScreenSections');
    const damage = estimateDamage(25, 2.0);
    expect(damage).toBeGreaterThan(0);
    expect(typeof damage).toBe('number');
  });

  it('boss attack preset labels are personal (not squad-related)', () => {
    const subtleCopy = getBossScreenCopy('subtle');
    expect(subtleCopy.actionLabel).not.toMatch(/squad|team|guild|social/i);

    const gameLikeCopy = getBossScreenCopy('game-like');
    expect(gameLikeCopy.actionLabel).not.toMatch(/squad|team|guild|social/i);

    const intenseCopy = getBossScreenCopy('intense');
    expect(intenseCopy.actionLabel).not.toMatch(/squad|team|guild|social/i);
  });
});

describe('BossScreenContent final release squad-free', () => {
  it('BossScreenContent does not import or reference squads', () => {
    const fs = require('fs');
    const path = require('path');
    const contentPath = path.resolve(__dirname, '..', 'BossScreenContent.tsx');
    const content = fs.readFileSync(contentPath, 'utf-8');

    expect(content).not.toMatch(/useUserSquads/);
    expect(content).not.toMatch(/squads/i);
    expect(content).not.toMatch(/Guild/);
    expect(content).not.toMatch(/canShowSquads/);
    expect(content).not.toMatch(/activeSquad/);
    expect(content).not.toMatch(/Squad Momentum/);
    expect(content).not.toMatch(/Find a squad/);
  });

  it('BossScreenSections does not reference squad props', () => {
    const fs = require('fs');
    const path = require('path');
    const contentPath = path.resolve(__dirname, '..', 'BossScreenSections.tsx');
    const content = fs.readFileSync(contentPath, 'utf-8');

    expect(content).not.toMatch(/activeSquad/);
    expect(content).not.toMatch(/onOpenSquad/);
    expect(content).not.toMatch(/squads/i);
  });
});
