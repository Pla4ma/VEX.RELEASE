import { readFileSync } from 'fs';
import { join } from 'path';

const rewardSyncSource = readFileSync(
  join(__dirname, '../../../screens/session/hooks/useSessionRewardSync.ts'),
  'utf8',
);

describe('session completion UI source of truth', () => {
  it('does not grant core currency or XP from the display hook', () => {
    const codeLines = rewardSyncSource.split('\n').filter(l => !l.trim().startsWith('//'));
    const code = codeLines.join('\n');
    expect(code).not.toContain('creditSessionRewards(');
    expect(code).not.toContain('applySessionMastery({');
    expect(code).not.toContain(
      'setQueryData<ProgressionSummaryData',
    );
  });

  it('keeps reward UI limited to refetching server-owned ledgers', () => {
    expect(rewardSyncSource).toContain('invalidateQueries');
    expect(rewardSyncSource).toContain('refetchProgressionSummary');
  });
});
