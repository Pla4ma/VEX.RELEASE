import { z } from 'zod';

import { parseJsonWithSchema, safeJsonParse, stringifyJsonSafe } from '../safe-json';

jest.mock('../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

describe('safe-json persistence helpers', () => {
  const context = { feature: 'test-feature', key: 'test-key' };

  it('parses valid JSON without changing the value', () => {
    expect(safeJsonParse('{"value":1}', context)).toEqual({ value: 1 });
  });

  it('returns null for corrupted JSON', () => {
    expect(safeJsonParse('{broken', context)).toBeNull();
  });

  it('returns schema data for valid persisted JSON', () => {
    const schema = z.object({ value: z.number() });

    expect(parseJsonWithSchema('{"value":2}', schema, context)).toEqual({ value: 2 });
  });

  it('returns null when persisted JSON has the wrong shape', () => {
    const schema = z.object({ value: z.number() });

    expect(parseJsonWithSchema('{"value":"bad"}', schema, context)).toBeNull();
  });

  it('returns null when a value cannot be stringified', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(stringifyJsonSafe(circular, context)).toBeNull();
  });
});
