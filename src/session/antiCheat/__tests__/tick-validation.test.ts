import { validateTick } from '../tick-validation';
import type { AntiCheatFlag } from '../../types';

type FlagCall = {
  type: AntiCheatFlag['type'];
  severity: AntiCheatFlag['severity'];
  evidence: Record<string, unknown>;
};

describe('validateTick', () => {
  it('allows fast duplicate render ticks when elapsed time also barely moved', () => {
    const flags: FlagCall[] = [];
    const result = validateTick(
      [{ timestamp: 1000, elapsed: 1000 }],
      1000,
      1016,
      1016,
      (type, severity, evidence) => {
        flags.push({ type, severity, evidence });
      },
    );

    expect(result).toEqual({ valid: true });
    expect(flags).toEqual([]);
  });

  it('rejects ticks that advance elapsed time too quickly', () => {
    const flags: FlagCall[] = [];
    const result = validateTick(
      [{ timestamp: 1000, elapsed: 1000 }],
      1000,
      2000,
      1100,
      (type, severity, evidence) => {
        flags.push({ type, severity, evidence });
      },
    );

    expect(result).toEqual({
      valid: false,
      warning: 'Suspicious tick timing',
    });
    expect(flags).toHaveLength(1);
    expect(flags[0]?.type).toBe('TIME_MANIPULATION');
  });
});
