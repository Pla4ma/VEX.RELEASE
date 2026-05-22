/**
 * Stage data hook isolation tests.
 * Verifies module exports and type shapes without calling React hooks in test scope.
 */
describe('stage home data hooks — import isolation', () => {
  it('useStageHomeData module exports stage-specific hooks', () => {
    const mod = require('../hooks/useStageHomeData');
    expect(typeof mod.useNewUserHomeData).toBe('function');
    expect(typeof mod.useActivatingHomeData).toBe('function');
    expect(typeof mod.useEngagedHomeData).toBe('function');
    expect(typeof mod.usePowerUserHomeData).toBe('function');
  });

  it('NEW_USER / ACTIVATING hooks do not import challenges/squads/interventions', () => {
    const modSource = require('fs').readFileSync(
      require('path').resolve(__dirname, '../hooks/useStageHomeData.ts'),
      'utf8',
    ) as string;
    // useNewUserHomeData and useActivatingHomeData should NOT reference
    // challenge hooks, squad hooks, or intervention hooks
    const newUserSection = modSource.slice(
      modSource.indexOf('export function useNewUserHomeData'),
      modSource.indexOf('export function useActivatingHomeData'),
    );
    const activatingSection = modSource.slice(
      modSource.indexOf('export function useActivatingHomeData'),
      modSource.indexOf('export function useEngagedHomeData'),
    );
    const sections = [newUserSection, activatingSection];
    for (const section of sections) {
      expect(section).not.toMatch(/useActiveChallenges/);
      expect(section).not.toMatch(/useClaimChallengeReward/);
      expect(section).not.toMatch(/useSquadMembersFocusing/);
      expect(section).not.toMatch(/useActiveIntervention/);
      expect(section).not.toMatch(/useNotificationBadge/);
      expect(section).not.toMatch(/useFreezeStreak/);
    }
  });
});
