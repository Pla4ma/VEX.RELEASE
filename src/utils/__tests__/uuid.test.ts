import { isValidUUID, generateSessionId, generateTransactionId, generateRewardId, shortId } from '../uuid';

describe('isValidUUID', () => {
  it('validates correct v4 UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('550e8400-e29b-71d4-a716-446655440000')).toBe(false); // v7, not v4
  });

  it('rejects UUIDs with wrong segment lengths', () => {
    expect(isValidUUID('550e840-e29b-41d4-a716-446655440000')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
  });

  it('rejects UUIDs with invalid variant bits', () => {
    expect(isValidUUID('550e8400-e29b-41d4-0716-446655440000')).toBe(false); // variant 0xx
  });

  it('is case-insensitive', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    expect(isValidUUID('A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D')).toBe(true);
  });
});

describe('generateSessionId', () => {
  it('generates ID with sess- prefix', () => {
    const id = generateSessionId();
    expect(id.startsWith('sess-')).toBe(true);
  });

  it('generates unique IDs', () => {
    const a = generateSessionId();
    const b = generateSessionId();
    expect(a).not.toBe(b);
  });

  it('includes timestamp', () => {
    const before = Date.now();
    const id = generateSessionId();
    const after = Date.now();
    const parts = id.split('-');
    const ts = parseInt(parts[1] || '0', 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('generateTransactionId', () => {
  it('generates ID with tx- prefix', () => {
    const id = generateTransactionId();
    expect(id.startsWith('tx-')).toBe(true);
  });

  it('generates unique IDs', () => {
    const a = generateTransactionId();
    const b = generateTransactionId();
    expect(a).not.toBe(b);
  });
});

describe('generateRewardId', () => {
  it('generates ID with rw- prefix', () => {
    const id = generateRewardId();
    expect(id.startsWith('rw-')).toBe(true);
  });

  it('generates unique IDs', () => {
    const a = generateRewardId();
    const b = generateRewardId();
    expect(a).not.toBe(b);
  });
});

describe('shortId', () => {
  it('generates 8-char string by default', () => {
    expect(shortId().length).toBe(8);
  });

  it('generates custom length', () => {
    expect(shortId(4).length).toBe(4);
    expect(shortId(12).length).toBe(12);
  });

  it('generates alphanumeric strings', () => {
    const id = shortId(20);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('generates unique values', () => {
    expect(shortId()).not.toBe(shortId());
  });
});
