/**
 * Session Feature — ID Generator Tests
 */

import {
  generateSessionId,
  generateShortId,
  generateUUID,
  IdGenerator,
} from '../utils/idGenerator';

describe('idGenerator', () => {
  test('generateSessionId returns string starting with sess_', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^sess_/);
  });

  test('generateSessionId produces unique IDs on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateSessionId()));
    expect(ids.size).toBe(50);
  });

  test('generateShortId includes the given prefix', () => {
    const id = generateShortId('test');
    expect(id).toMatch(/^test_/);
  });

  test('generateUUID returns a valid UUID format', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('IdGenerator object exports all functions', () => {
    expect(typeof IdGenerator.generateSessionId).toBe('function');
    expect(typeof IdGenerator.generateShortId).toBe('function');
    expect(typeof IdGenerator.generateUUID).toBe('function');
  });
});
