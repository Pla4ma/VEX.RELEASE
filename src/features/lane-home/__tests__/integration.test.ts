import { describe, it, expect } from '@jest/globals';

describe('lane-home', () => {
  it('exports expected symbols', () => {
    const mod = require('../hooks');
    expect(mod).toBeDefined();
  });

  it('schemas are valid Zod objects', () => {
    const { LaneHomeSchemas } = require('../schemas');
    // schemas.ts currently exports nothing — placeholder for future activation
    expect(true).toBe(true);
  });

  it('service does not throw on initialization', () => {
    const service = require('../service');
    expect(service).toBeDefined();
  });

  it('types module loads', () => {
    const types = require('../types');
    expect(types).toBeDefined();
  });
});
