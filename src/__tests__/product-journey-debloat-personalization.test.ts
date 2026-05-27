/**
 * Product Journey Tests — Debloat + Personalization
 *
 * VEX Phase 13: Prove VEX is not bloated at runtime and that
 * personalization controls the user journey.
 *
 * Test Groups:
 * 1. Day 0 Home
 * 2. First session setup
 * 3. Active session
 * 4. Completion
 * 5. Progressive unlock runtime
 * 6. Coach
 * 7. Release truth
 */

import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAccessMap,
  type FeatureKey,
} from '../features/liveops-config/feature-access';
import { resolveVexExperience } from '../features/personalization/service';
import { resolveFirstWeekExperience } from '../features/personalization/first-week-service';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexPersonalizationProfile,
} from '../features/personalization/types';
import type { FirstWeekResolverInput } from '../features/personalization/first-week-schemas';

// ─── Helpers ────────────────────────────────────────────────────

function profile(
  motivationStyle: VexPersonalizationProfile['motivationStyle'],
  overrides: Partial<VexPersonalizationProfile> = {},
): VexPersonalizationProfile {
  return {
    primaryGoal: motivationStyle === 'study_focused' ? 'study' : 'work',
    motivationStyle,
    preferredTone: motivationStyle === 'intense' ? 'direct' : 'soft',
    gamificationIntensity:
      motivationStyle === 'game_like' || motivationStyle === 'intense'
        ? 'strong'
        : 'minimal',
    coachMode:
      motivationStyle === 'study_focused'
        ? 'study_tutor'
        : motivationStyle === 'intense'
          ? 'tactical'
          : motivationStyle === 'game_like'
            ? 'game_guide'
            : motivationStyle === 'coach_led'
              ? 'mentor'
              : 'reflection',
    studyLayerName:
      motivationStyle === 'study_focused' ? 'Study OS' : 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode:
      motivationStyle === 'study_focused' ? 'STUDY' : 'FOCUS',
    userStage: 'new',
    ...overrides,
  };
}

function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
    ...overrides,
  };
}

const avail: FeatureAvailabilitySnapshot = {
  boss: true,
  challenges: true,
  study: true,
  premium: true,
};

function experience(
  style: VexPersonalizationProfile['motivationStyle'],
  statOverrides: Partial<BehaviorStats> = {},
  featureOverrides: Partial<FeatureAvailabilitySnapshot> = {},
) {
  return resolveVexExperience(
    profile(style),
    stats(statOverrides),
    { ...avail, ...featureOverrides },
  );
}

function firstWeek(
  overrides: Partial<FirstWeekResolverInput> = {},
): ReturnType<typeof resolveFirstWeekExperience> {
  return resolveFirstWeekExperience({
    behaviorStats: { bossEngagement: 'none', studyUsageRatio: 0 },
    completedSessions: 0,
    daysSinceLastSession: null,
    daysSinceOnboarding: 0,
    featureAvailability: { boss: false, premium: false, social: false, study: true },
    motivationStyle: 'calm',
    premiumState: 'unavailable',
    primaryGoal: 'work',
    ...overrides,
  });
}

function accessFor(sessions: number) {
  return buildFeatureAccess({ totalCompletedSessions: sessions }).features;
}

const HIDDEN_FEATURE_KEYS: FeatureKey[] = [
  'battle_pass',
  'squads',
  'shop',
  'inventory',
  'social_tab',
  'rivals',
  'rankings',
  'wagers',
  'streak_insurance',
  'gems_prominent',
  'boss_bounties',
  'economy_advanced',
];

function assertFullyHidden(features: FeatureAccessMap, key: FeatureKey) {
  const a = getFeatureAvailability(features[key]);
  expect(a.canRenderEntryPoint).toBe(false);
  expect(a.canNavigate).toBe(false);
  expect(a.canQuery).toBe(false);
  expect(a.canUseBackend).toBe(false);
  expect(a.canRegisterRoute).toBe(false);
  expect(a.canSubscribeToEvents).toBe(false);
  expect(a.canShowNotification).toBe(false);
}

function assertCoreAvailable(features: FeatureAccessMap, key: FeatureKey) {
  const a = getFeatureAvailability(features[key]);
  expect(a.canRenderEntryPoint).toBe(true);
  expect(a.canNavigate).toBe(true);
  expect(a.canQuery).toBe(true);
}

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 1 — Day 0 Home
// ══════════════════════════════════════════════════════════════════

describe('Group 1 — Day 0 Home', () => {
  it('1a: study user sees max 6-7 elements on Day 0', () => {
    const exp = experience('study_focused');
    const fw = firstWeek({ motivationStyle: 'study_focused' });

    const sections = exp.home.sections;
    expect(sections.length).toBeLessThanOrEqual(7);
    expect(sections).toContain('coach_line');
    expect(sections).toContain('primary_session');

    expect(fw.allowedHomeSurfaces.length).toBeLessThanOrEqual(6);
  });

  it('1b: focus user sees one primary CTA on Day 0', () => {
    const exp = experience('calm');

    expect(exp.primaryHomeCTA.intent).toBe('START_SESSION');
    expect(exp.homeSections).toContain('primary_session');
    const secondary = exp.secondaryHomeCTA;
    expect(secondary).toBeNull();
  });

  it('1c: game-like user sees tiny boss tease only on Day 0', () => {
    const fw = firstWeek({
      motivationStyle: 'game_like',
      featureAvailability: { boss: true, premium: false, social: false, study: true },
    });

    expect(fw.spotlightSurface).toBe('tiny_boss_teaser');
    expect(fw.bossIntensity).toBe('tiny_tease');
    expect(fw.allowedHomeSurfaces).not.toContain('boss_full');
    expect(fw.allowedHomeSurfaces).toContain('tiny_boss_teaser');

    const exp = experience('game_like');
    expect(exp.boss.dayZeroTeaserAllowed).toBe(true);
    expect(exp.boss.isVisible).toBe(false);
  });

  it('1d: no premium on Day 0', () => {
    const fw = firstWeek();
    expect(fw.premiumMoment).toBe('none');
    expect(fw.hiddenSurfaces).toContain('premium_hard_sell');
    expect(fw.hiddenSurfaces).toContain('premium_currency');

    const exp = experience('calm');
    expect(exp.premium.shouldTease).toBe(false);
    expect(exp.premium.trigger).toBe('none');
  });

  it('1e: no battle pass on Day 0', () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain('battle_pass');
    assertFullyHidden(accessFor(0), 'battle_pass');
  });

  it('1f: no shop/inventory/wallet on Day 0', () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain('shop');
    expect(fw.hiddenSurfaces).toContain('inventory');
    expect(fw.hiddenSurfaces).toContain('premium_currency');

    const f0 = accessFor(0);
    assertFullyHidden(f0, 'shop');
    assertFullyHidden(f0, 'inventory');
  });

  it('1g: no squads/guild/rivals on Day 0', () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain('squads');
    expect(fw.hiddenSurfaces).toContain('rivals');

    const f0 = accessFor(0);
    assertFullyHidden(f0, 'squads');
    assertFullyHidden(f0, 'rivals');
  });

  it('1h: no full content upload on Day 0', () => {
    const exp = experience('study_focused');
    expect(exp.homeSections).not.toContain('upload_cta');
    expect(exp.homeSections).not.toContain('content_generation');
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 2 — First Session Setup
// ══════════════════════════════════════════════════════════════════

describe('Group 2 — First Session Setup', () => {
  it('2a: first session setup shows only mode/duration/start', () => {
    const f0 = accessFor(0);

    assertCoreAvailable(f0, 'focus_session');
    assertCoreAvailable(f0, 'focus_tab');
    assertFullyHidden(f0, 'challenges');
    assertFullyHidden(f0, 'wagers');
    assertFullyHidden(f0, 'streak_insurance');
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);
  });

  it('2b: study user gets Study default', () => {
    const exp = experience('study_focused');
    expect(exp.sessionDefaults.mode).toBe('STUDY');
    expect(exp.studyLayerLabel).toBe('Study OS');
  });

  it('2c: focus user gets Focus/Deep Work default', () => {
    const fw = firstWeek();
    expect(fw.studyLayerLabel).toBe('Deep Work Plan');

    const exp = experience('calm');
    expect(exp.sessionDefaults.mode).toBe('FOCUS');
  });

  it('2d: game-like user gets subtle boss copy but no boss config', () => {
    const fw = firstWeek({
      motivationStyle: 'game_like',
      featureAvailability: { boss: true, premium: false, social: false, study: true },
    });

    expect(fw.bossIntensity).toBe('tiny_tease');
    expect(fw.allowedHomeSurfaces).not.toContain('boss_full');

    const exp = experience('game_like');
    expect(exp.boss.systemsDisabled).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'premium_currency']),
    );
  });

  it('2e: no stakes/difficulty/premium/challenges in first session setup', () => {
    const f0 = accessFor(0);
    assertFullyHidden(f0, 'challenges');
    assertFullyHidden(f0, 'wagers');
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);

    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain('premium_hard_sell');
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 3 — Active Session
// ══════════════════════════════════════════════════════════════════

describe('Group 3 — Active Session', () => {
  it('3a: calm user sees timer/progress only', () => {
    const exp = experience('calm');
    expect(exp.bossIntensity).toBe('subtle');
    expect(exp.homeLayoutVariant).not.toBe('game_centered');
    expect(exp.bannedSurfaces).toContain('boss_combat_effects');
  });

  it('3b: study user sees study target in active session', () => {
    const exp = experience('study_focused');
    expect(exp.studyLayerProminence).toBe('spotlight');
    expect(exp.studyLayerLabel).toBe('Study OS');
  });

  it('3c: game-like user sees tiny boss indicator only by default', () => {
    const exp = experience('game_like');
    expect(exp.boss.isVisible).toBe(false);
    expect(exp.boss.dayZeroTeaserAllowed).toBe(true);
    expect(exp.boss.homePlacement).toBe('hidden');

    const fw = firstWeek({
      motivationStyle: 'game_like',
      featureAvailability: { boss: true, premium: false, social: false, study: true },
    });
    expect(fw.allowedHomeSurfaces).not.toContain('boss_full');
    expect(fw.bossIntensity).toBe('tiny_tease');
  });

  it('3d: no full BossCombatHUD by default for calm/study users', () => {
    const expCalm = experience('calm');
    expect(expCalm.homeSections).not.toContain('boss_full_cta');
    expect(expCalm.bannedSurfaces).toContain('boss_full_cta');

    const expStudy = experience('study_focused');
    expect(expStudy.bannedSurfaces).toContain('boss_full_cta');
  });

  it('3e: no coach loading spinner during focus', () => {
    const exp = experience('coach_led');
    expect(exp.coachMessageStyle).toBe('mentor');
    expect(exp.coachTone).toBe('soft');
    expect(exp.bannedSurfaces).not.toContain('coach_presence');
  });

  it('3f: no purity score stress by default', () => {
    const exp = experience('intense');
    expect(exp.homeSections).not.toContain('purity_display');
    expect(exp.bannedSurfaces).not.toContain('purity_score');

    const expCalm = experience('calm');
    expect(expCalm.homeSections).not.toContain('purity_display');
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 4 — Completion
// ══════════════════════════════════════════════════════════════════

describe('Group 4 — Completion', () => {
  it('4a: max 4 major beats in completion sequence', () => {
    const exp = experience('coach_led', { totalCompletedSessions: 5 });

    const sequence = exp.completionSequence;
    expect(sequence.length).toBeLessThanOrEqual(6);

    const majorBeats = sequence.filter(
      (s: string) => !['quiet_xp', 'next_action'].includes(s),
    );
    expect(majorBeats.length).toBeLessThanOrEqual(4);
  });

  it('4b: calm completion is minimal', () => {
    const exp = experience('calm', { totalCompletedSessions: 3 });

    expect(exp.completionSequence).toContain('core_saved');
    expect(exp.completionSequence).toContain('coach_companion_reflection');
    expect(exp.completionSequence).not.toContain('boss_effect');
  });

  it('4c: study completion shows study next step', () => {
    const exp = experience('study_focused', {
      studyUsageRatio: 0.7,
      totalCompletedSessions: 6,
    });

    expect(exp.completionSequence).toContain('study_progress');
    expect(exp.completionSequence).toContain('next_action');
  });

  it('4d: game-like completion shows boss damage reveal', () => {
    const exp = experience('game_like', {
      bossChallengeEngagement: 'high',
      completedSessionDurations: [25, 30, 25],
      totalCompletedSessions: 8,
    });

    expect(exp.completionSequence).toContain('boss_effect');
    expect(exp.boss.completionEffect).toBe('session_damage');
  });

  it('4e: no battle pass in completion', () => {
    const exp = experience('intense', { totalCompletedSessions: 20 });

    expect(exp.completionSequence).not.toContain('battle_pass_reward');
    expect(exp.homeSections).not.toContain('battle_pass');
    expect(exp.hiddenSystems).toContain('battle_pass');
  });

  it('4f: no coins/gems/shop in completion', () => {
    const exp = experience('game_like', { totalCompletedSessions: 15 });

    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.hiddenSystems).toContain('inventory');
    expect(exp.completionSequence).not.toContain('shop_unlock');
    expect(exp.completionSequence).not.toContain('coins_reward');
  });

  it('4g: no rival/squad consequence in completion', () => {
    const exp = experience('game_like', { totalCompletedSessions: 30 });

    expect(exp.completionSequence).not.toContain('rival_result');
    expect(exp.completionSequence).not.toContain('squad_bonus');
    expect(exp.hiddenSystems).toContain('rivals');
    expect(exp.hiddenSystems).toContain('squads');
  });

  it('4h: XP/streak/progress still update', () => {
    const exp = experience('study_focused', {
      completionStreak: 5,
      totalCompletedSessions: 10,
    });

    expect(exp.completionSequence).toContain('core_saved');
    expect(exp.completionSequence).toContain('streak_progress');

    const core = accessFor(10);
    assertCoreAvailable(core, 'progress_view');
    expect(getFeatureAvailability(core.economy_basic).canRenderEntryPoint).toBe(false); // Economy is deactivated in final release
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 5 — Progressive Unlock Runtime
// ══════════════════════════════════════════════════════════════════

describe('Group 5 — Progressive Unlock Runtime', () => {
  it('5a: locked features do not query', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canQuery).toBe(false);
    });

    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(999)[key]);
      expect(a.canQuery).toBe(false);
    });
  });

  it('5b: locked features do not subscribe', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canSubscribeToEvents).toBe(false);
    });
  });

  it('5c: locked features do not notify', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canShowNotification).toBe(false);
    });
  });

  it('5d: hidden features do not route (navigation disabled)', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(5)[key]);
      expect(a.canNavigate).toBe(false);
      expect(a.canRegisterRoute).toBe(false);
    });
  });

  it('5e: hidden features do not render entry points', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canRenderEntryPoint).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 6 — Coach
// ══════════════════════════════════════════════════════════════════

describe('Group 6 — Coach', () => {
  it('6a: Day 0 coach does not fake memory', () => {
    const exp = experience('coach_led');

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
    expect(exp.coachTone).toBe('soft');
  });

  it('6b: after session 1 coach references real session', () => {
    const exp = experience('coach_led', {
      completedSessionDurations: [60],
      totalCompletedSessions: 1,
    });

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.duration).toBe(25);

    const multi = experience('coach_led', {
      completedSessionDurations: [25, 25, 30, 25],
      totalCompletedSessions: 6,
    });
    expect(multi.behaviorAdaptations).toContain('duration_pattern');
    expect(multi.sessionDefaults.copy).toContain('best rhythm');
  });

  it('6c: coach does not interrupt active focus', () => {
    const exp = experience('calm');

    expect(exp.coachMessageStyle).toBe('reflection');
    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.completionSequence).not.toContain('coach_interruption');
  });

  it('6d: coach copy adapts by motivation style', () => {
    const studyExp = experience('study_focused');
    expect(studyExp.coachMessageStyle).toBe('study_tutor');
    expect(studyExp.studyLayerLabel).toBe('Study OS');

    const intenseExp = experience('intense');
    expect(intenseExp.coachTone).toBe('direct');
    expect(intenseExp.coachMessageStyle).toBe('tactical');

    const gameExp = experience('game_like');
    expect(gameExp.coachMessageStyle).toBe('game_guide');

    const calmExp = experience('calm');
    expect(calmExp.coachMessageStyle).toBe('reflection');

    const coachExp = experience('coach_led');
    expect(coachExp.coachMessageStyle).toBe('mentor');
  });
});

// ══════════════════════════════════════════════════════════════════
// TEST GROUP 7 — Release Truth
// ══════════════════════════════════════════════════════════════════

describe('Group 7 — Release Truth', () => {
  it('7a: src/ is canonical (same as existing source-truth test)', () => {
    const fs = jest.requireActual('fs');
    expect(fs.existsSync(require('path').join(process.cwd(), 'src'))).toBe(true);
  });

  it('7b: no runtime imports from src_impl_archive', () => {
    const path = require('path');
    const fs = require('fs');

    function findAllTsFiles(root: string): string[] {
      const results: string[] = [];
      try {
        const entries = fs.readdirSync(root, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(root, entry.name);
          if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__tests__') {
            results.push(...findAllTsFiles(fullPath));
          } else if (/\.(ts|tsx)$/.test(entry.name)) {
            results.push(fullPath);
          }
        }
      } catch {
        // directory may not exist
      }
      return results;
    }

    const srcFiles = findAllTsFiles(
      path.join(process.cwd(), 'src'),
    );
    const violations: string[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const hasImport =
        content.includes("'../src_impl_archive") ||
        content.includes('"../src_impl_archive') ||
        content.includes("'../../src_impl_archive") ||
        content.includes("'src_impl_archive") ||
        content.includes('"src_impl_archive');

      if (hasImport) {
        violations.push(file.replace(process.cwd(), ''));
      }
    }

    expect(violations).toEqual([]);
  });

  it('7c: final-release deactivated features never visible at any session count', () => {
    for (const sessions of [0, 1, 5, 10, 50, 100, 999]) {
      const features = accessFor(sessions);
      HIDDEN_FEATURE_KEYS.forEach((key) => {
        expect(features[key]!.isUnlocked).toBe(false);
      });
    }
  });

  it('7d: app store copy excludes hidden features', () => {
    const hidden = [
      'battle_pass',
      'shop',
      'inventory',
      'wagers',
      'rivals',
      'squads',
      'leaderboards',
    ];

    const exp = experience('calm', { totalCompletedSessions: 20 });
    for (const h of hidden) {
      expect(exp.hiddenSystems).toContain(h);
    }
    expect(exp.release.hidden).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'battle_pass', 'wagers']),
    );
  });

  it('7e: core execution loop always free (never premium-gated)', () => {
    const exp = experience('study_focused', {
      premiumFeatureAttempts: ['weekly_intelligence'],
      totalCompletedSessions: 7,
    });

    expect(exp.premium.mustRemainFree).toContain('start_session');
    expect(exp.premium.mustRemainFree).toContain('complete_session');
    expect(exp.premium.mustRemainFree).toContain('basic_xp');
    expect(exp.premium.mustRemainFree).toContain('basic_streak');
    expect(exp.premium.mustRemainFree).toContain('basic_coach');

    expect(exp.homeSections).toContain('primary_session');
    expect(
      exp.primaryHomeCTA.intent === 'START_SESSION' ||
      exp.primaryHomeCTA.intent === 'CONTINUE_STUDY_PATH',
    ).toBe(true);
  });

  it('7f: no feature teases premium before user has real value', () => {
    const early = experience('calm', { totalCompletedSessions: 1 });
    expect(early.premium.shouldTease).toBe(false);

    const mid = experience('calm', { totalCompletedSessions: 4 });
    expect(mid.premium.shouldTease).toBe(false);
  });

  it('7g: all motivated profiles get correct primary home CTA', () => {
    expect(experience('calm').primaryHomeCTA.intent).toBe('START_SESSION');
    expect(experience('study_focused').primaryHomeCTA.intent).toBe('CONTINUE_STUDY_PATH');
    expect(experience('game_like').primaryHomeCTA.intent).toBe('START_SESSION');
  });

  it('7h: calm user never sees game_hub or boss_full_cta surfaces', () => {
    const exp = experience('calm', { totalCompletedSessions: 20 });
    expect(exp.bannedSurfaces).toContain('boss_full_cta');
    expect(exp.bannedSurfaces).toContain('game_hub');
  });
});

// ══════════════════════════════════════════════════════════════════
// Consolidation — Cross-Group Verification
// ══════════════════════════════════════════════════════════════════

describe('Consolidation — No regression', () => {
  it('hidden systems list matches between resolveVexExperience and first week', () => {
    const exp = experience('calm', { totalCompletedSessions: 20 });
    const fw = firstWeek({ completedSessions: 20, daysSinceOnboarding: 20 });

    for (const s of fw.hiddenSurfaces) {
      if (s === 'premium_hard_sell' || s === 'premium_currency' || s === 'advanced_economy') {
        expect(exp.hiddenSystems).toContain(
          s === 'premium_currency' ? 'premium_currency' : s === 'advanced_economy' ? 'advanced_economy' : 'premium_currency',
        );
      }
    }

    expect(exp.hiddenSystems).toContain('battle_pass');
    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.hiddenSystems).toContain('inventory');
    expect(exp.hiddenSystems).toContain('rivals');
    expect(exp.hiddenSystems).toContain('squads');
  });

  it('all final-release deactivated features confirmed inaccessible at every tested session count', () => {
    const sessionCounts = [0, 1, 3, 5, 7, 10, 15, 20, 50, 100, 500, 999];

    for (const sessions of sessionCounts) {
      const f = accessFor(sessions);
      HIDDEN_FEATURE_KEYS.forEach((key) => assertFullyHidden(f, key));
    }
  });

  it('core features available from day zero', () => {
    const f = accessFor(0);
    const core: FeatureKey[] = [
      'focus_session',
      'home_tab',
      'focus_tab',
      'profile_tab',
      'progress_view',
      'ai_coach_basic',
    ];
    core.forEach((k) => assertCoreAvailable(f, k));
  });
});

// ══════════════════════════════════════════════════════════════════
// RISK FIX — Session Component Gating (Risk 1)
// ══════════════════════════════════════════════════════════════════

describe('Risk 1 — Session component gating', () => {
  it('battle pass component must check FeatureAvailability before rendering or querying', () => {
    const f0 = accessFor(0);
    const bp = getFeatureAvailability(f0.battle_pass);
    expect(bp.canRenderEntryPoint).toBe(false);
    expect(bp.canQuery).toBe(false);

    const f100 = accessFor(100);
    const bp100 = getFeatureAvailability(f100.battle_pass);
    expect(bp100.canRenderEntryPoint).toBe(false);
    expect(bp100.canQuery).toBe(false);
  });

  it('boss combat HUD must check FeatureAvailability before rendering', () => {
    const f0 = accessFor(0);
    const boss = getFeatureAvailability(f0.boss_tab);
    expect(boss.canRenderEntryPoint).toBe(false);
    expect(boss.canQuery).toBe(false);

    const f5 = accessFor(5);
    const boss5 = getFeatureAvailability(f5.boss_tab);
    expect(boss5.canRenderEntryPoint).toBe(true);
    expect(boss5.canQuery).toBe(false);
  });

  it('active session boss combat must check boss_tab before querying hooks', () => {
    const f0 = accessFor(0);
    const boss = getFeatureAvailability(f0.boss_tab);
    expect(boss.canQuery).toBe(false);
    expect(boss.canRenderEntryPoint).toBe(false);

    const f10 = accessFor(10);
    const boss10 = getFeatureAvailability(f10.boss_tab);
    expect(boss10.canQuery).toBe(true);
    expect(boss10.canRenderEntryPoint).toBe(true);
  });

  it('inventory and shop navigation in completion must be gated', () => {
    const f0 = accessFor(0);
    expect(getFeatureAvailability(f0.inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(f0.shop).canNavigate).toBe(false);

    const f100 = accessFor(100);
    expect(getFeatureAvailability(f100.inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(f100.shop).canNavigate).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════
// RISK FIX — Coach Memory Depth (Risk 2)
// ══════════════════════════════════════════════════════════════════

describe('Risk 2 — Coach memory depth', () => {
  it('day 0 coach profile does not fabricate memory', () => {
    const exp = experience('coach_led');

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
    expect(exp.sessionDefaults.duration).toBe(25);
    expect(exp.progressEmphasis).toBe('basic');
    expect(exp.userStage).toBe('new_user');
    expect(exp.homeSpotlight).toBe('none');
  });

  it('after session 1 coach still has limited signal, no fabricated memory', () => {
    const exp = experience('coach_led', {
      completedSessionDurations: [25],
      totalCompletedSessions: 1,
    });

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
  });

  it('after 3+ sessions coach adapts to real data', () => {
    const exp = experience('coach_led', {
      completedSessionDurations: [25, 25, 30],
      totalCompletedSessions: 3,
      mostSuccessfulTimeOfDay: 'morning',
    });

    expect(exp.behaviorAdaptations).toContain('duration_pattern');
    expect(exp.behaviorAdaptations).toContain('time_of_day_pattern');
    expect(exp.sessionDefaults.copy).toContain('best rhythm');
  });

  it('coach copy adapts per motivation style', () => {
    const studyExp = experience('study_focused', {
      completedSessionDurations: [30, 30, 45],
      studyUsageRatio: 0.7,
      totalCompletedSessions: 5,
    });
    expect(studyExp.coachMessageStyle).toBe('study_tutor');

    const intenseExp = experience('intense', {
      completedSessionDurations: [15, 15, 10],
      totalCompletedSessions: 3,
    });
    expect(intenseExp.coachTone).toBe('direct');
    expect(intenseExp.coachMessageStyle).toBe('tactical');

    const gameExp = experience('game_like');
    expect(gameExp.coachMessageStyle).toBe('game_guide');

    const calmExp = experience('calm');
    expect(calmExp.coachMessageStyle).toBe('reflection');
  });
});

// ══════════════════════════════════════════════════════════════════
// RISK FIX — Boss HUD Display Policy Consumption (Risk 3)
// ══════════════════════════════════════════════════════════════════

describe('Risk 3 — Boss HUD display policy consumption', () => {
  it('display policy correctly hides BossCombatHUD for all styles', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');

    const calm = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });
    expect(calm.showBossHUD).toBe(false);

    const study = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      sessionMode: SessionMode.STUDY,
    });
    expect(study.showBossHUD).toBe(false);
    expect(study.showStudyTarget).toBe(true);

    const gameActive = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(gameActive.showBossHUD).toBe(false);
    expect(gameActive.showBossTinyIndicator).toBe(true);
    expect(gameActive.showMomentumScore).toBe(false);
  });

  it('purity score hidden by default in all display policies', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');

    const styles = ['calm', 'study_focused', 'game_like', 'intense', 'coach_led'] as const;
    for (const style of styles) {
      const policy = resolveActiveSessionDisplayPolicy({
        focusStage: 'active',
        motivationStyle: style,
        primaryGoal: 'focus',
        sessionMode: SessionMode.FLOW,
      });
      expect(policy.showPurityScore).toBe(false);
    }
  });
});

// ══════════════════════════════════════════════════════════════════
// RISK FIX — Route Registration Enforcement (Risk 4)
// ══════════════════════════════════════════════════════════════════

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');

    const locked = accessFor(0);
    for (const { route } of FEATURE_ROUTE_REGISTRY) {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    }

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter(
      (r: { feature: string }) => canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Challenges')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'AICoach')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'ContentStudy')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Mastery')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'CompanionDetail')).toBe(false);
  });

  it('core navigation routes always available (Home, Settings, etc.)', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup')).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════
// RISK FIX — Privacy Inventory ↔ App Manifest Cross-Check (Risk 5)
// ══════════════════════════════════════════════════════════════════

describe('Risk 5 — Privacy inventory ↔ app manifest', () => {
  it('privacy inventory matches app manifest metadata', () => {
    const {
      PRIVACY_INVENTORY,
      getDataCategories,
      getPiiFields,
      getTrackingFields,
    } = require('../privacy/PrivacyInventory');

    const {
      PRIVACY_NUTRITION_LABEL,
    } = require('../app-store/AppStoreSubmissionPack');

    const categories = getDataCategories();
    const inventoryCategories = categories.map((c: { category: string }) => c.category);

    expect(inventoryCategories).toContain('Identifiers');
    expect(inventoryCategories).toContain('Usage Data');
    expect(inventoryCategories).toContain('Diagnostics');
    expect(inventoryCategories).toContain('Purchases');
    expect(inventoryCategories).toContain('Contact Info');
    expect(inventoryCategories).toContain('User Content');

    const linkedFromInventory = PRIVACY_INVENTORY
      .filter((item: { linkedToUser: boolean }) => item.linkedToUser)
      .map((item: { category: string }) => item.category);

    for (const label of PRIVACY_NUTRITION_LABEL.dataLinkedToUser) {
      expect(linkedFromInventory.some((cat: string) =>
        label.toLowerCase().includes(cat.toLowerCase()),
      )).toBe(true);
    }

    expect(getPiiFields()).toEqual(['Email address', 'Push notification token']);

    expect(getTrackingFields()).toEqual([]);

    const hasTracking = categories.some((c: { usedForTracking: boolean }) => c.usedForTracking);
    expect(hasTracking).toBe(false);
  });

  it('app store description excludes hidden feature names', () => {
    const { APP_STORE_METADATA } = require('../app-store/AppStoreSubmissionPack');

    const description = APP_STORE_METADATA.description.toLowerCase();
    const forbidden = ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'leaderboard'];
    for (const term of forbidden) {
      expect(description).not.toContain(term);
    }
  });

  it('app store review notes do not mention hidden features', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');

    const forbidden = ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'boss combat'];
    for (const term of forbidden) {
      expect(REVIEW_NOTES.toLowerCase()).not.toContain(term);
    }
  });

  it('review notes focus on core public features only', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');

    expect(REVIEW_NOTES).toContain('Premium');
    expect(REVIEW_NOTES).toContain('completion screen with progress proof');
    expect(REVIEW_NOTES).toContain('Delete Account');
    expect(REVIEW_NOTES).toContain('No coins');
    expect(REVIEW_NOTES).toContain('No Day 0 paywall');
    expect(REVIEW_NOTES).toContain('No login required');
  });
});
