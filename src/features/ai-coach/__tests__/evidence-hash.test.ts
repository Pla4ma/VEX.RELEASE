import { hashEvidence } from '../memory/CoachMemory';

describe('Evidence hash', () => {
  it('hashEvidence produces consistent output', () => {
    const hash1 = hashEvidence('test evidence');
    const hash2 = hashEvidence('test evidence');
    expect(hash1).toBe(hash2);
  });

  it('hashEvidence produces different output for different input', () => {
    const hash1 = hashEvidence('evidence A');
    const hash2 = hashEvidence('evidence B');
    expect(hash1).not.toBe(hash2);
  });

  it('hashEvidence starts with ev- prefix', () => {
    const hash = hashEvidence('test');
    expect(hash).toMatch(/^ev-/);
  });
});
