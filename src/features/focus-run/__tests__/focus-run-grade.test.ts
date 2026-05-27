import { computeFocusRunGrade } from './focus-run.helpers';
import { MOCK_RUN } from './focus-run.helpers';
import type { FocusRun, FocusRunGrade } from '../schemas';

describe('computeFocusRunGrade', () => {
  const gradeCases: Array<{
    encounters: number;
    clean: number;
    recovery: number;
    upgrades: number;
    expected: FocusRunGrade;
  }> = [
    { encounters: 0, clean: 0, recovery: 0, upgrades: 0, expected: 'D' },
    { encounters: 2, clean: 0, recovery: 0, upgrades: 0, expected: 'C' },
    { encounters: 3, clean: 2, recovery: 0, upgrades: 0, expected: 'B' },
    { encounters: 6, clean: 2, recovery: 2, upgrades: 1, expected: 'A' },
    { encounters: 8, clean: 3, recovery: 3, upgrades: 2, expected: 'S' },
  ];

  for (const tc of gradeCases) {
    it(`grade=${tc.expected} for encounters=${tc.encounters} clean=${tc.clean} recovery=${tc.recovery} upgrades=${tc.upgrades}`, () => {
      const run: FocusRun = {
        ...MOCK_RUN,
        cleanStarts: tc.clean,
        completedEncounters: tc.encounters,
        recoveryWins: tc.recovery,
        reflectionUpgrades: tc.upgrades,
        status: 'completed',
      };
      expect(computeFocusRunGrade(run)).toBe(tc.expected);
    });
  }
});
