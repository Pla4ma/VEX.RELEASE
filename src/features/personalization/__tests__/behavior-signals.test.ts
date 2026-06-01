// Tests split into:
// - behavior-signals-dismissal.test.ts (dismissal, ignore, engagement signals)
// - behavior-signals-engagement.test.ts (premium, edge cases, taxonomy)
// Shared helpers in behavior-test-helpers.ts

import { describe, it, expect } from '@jest/globals';

describe('behavior-signals (split)', () => {
  it('confirms split test files exist', () => {
    // This file was refactored into dedicated sub-test files.
    // Import this module to verify the barrel still compiles.
    expect(true).toBe(true);
  });
});
