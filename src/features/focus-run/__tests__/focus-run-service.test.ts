/**
 * Focus Run — Service Tests
 *
 * Tests for startFocusRun and recordFocusRunEvent.
 */

import { startFocusRun, recordFocusRunEvent } from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

function weekStart(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

describe('Focus Run Service', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  describe('startFocusRun', () => {
    it('creates a new focus run', async () => {
      const now = Date.now();
      const run = await startFocusRun('user-1', now);
      expect(run.userId).toBe('user-1');
      expect(run.status).toBe('active');
      expect(run.weekStartsAt).toBe(weekStart(now));
    });

    it('returns existing active run for same week', async () => {
      const now = Date.now();
      const run1 = await startFocusRun('user-1', now);
      const run2 = await startFocusRun('user-1', now);
      expect(run1.id).toBe(run2.id);
    });

    it('creates new run for different week', async () => {
      const now = Date.now();
      const run1 = await startFocusRun('user-1', now);
      // 7 days later
      const nextWeek = now + 7 * 24 * 60 * 60 * 1000;
      const run2 = await startFocusRun('user-1', nextWeek);
      expect(run1.id).not.toBe(run2.id);
    });

    it('initializes with zero counters', async () => {
      const run = await startFocusRun('user-1', Date.now());
      expect(run.cleanStarts).toBe(0);
      expect(run.completedRuns).toBe(0);
      expect(run.recoveryWins).toBe(0);
      expect(run.reflectionUpgrades).toBe(0);
    });

    it('initializes with run_started event', async () => {
      const run = await startFocusRun('user-1', Date.now());
      expect(run.events.length).toBe(1);
      expect(run.events[0].type).toBe('run_started');
    });

    it('includes focus modifiers', async () => {
      const run = await startFocusRun('user-1', Date.now());
      expect(run.focusModifiers.length).toBeGreaterThan(0);
    });
  });

  describe('recordFocusRunEvent', () => {
    it('records a clean_start event', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'clean_start',
        userId: 'user-1',
      });
      expect(run.cleanStarts).toBe(1);
      expect(run.events.length).toBe(2); // start + clean_start
      expect(run.events[1].type).toBe('clean_start');
    });

    it('records a run_milestone event', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'run_milestone',
        userId: 'user-1',
      });
      expect(run.completedRuns).toBe(1);
    });

    it('records a recovery_win event', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'recovery_win',
        userId: 'user-1',
      });
      expect(run.recoveryWins).toBe(1);
    });

    it('records a reflection_upgrade event', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'reflection_upgrade',
        userId: 'user-1',
      });
      expect(run.reflectionUpgrades).toBe(1);
    });

    it('records run_completed and sets status', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'run_completed',
        userId: 'user-1',
      });
      expect(run.status).toBe('completed');
    });

    it('increments multiple events', async () => {
      await recordFocusRunEvent({
        eventType: 'clean_start',
        userId: 'user-1',
      });
      const run = await recordFocusRunEvent({
        eventType: 'clean_start',
        userId: 'user-1',
      });
      expect(run.cleanStarts).toBe(2);
      expect(run.events.length).toBe(3); // start + 2 clean_starts
    });

    it('includes signal in event when provided', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'clean_start',
        userId: 'user-1',
        signal: 'phone_away',
      });
      const lastEvent = run.events[run.events.length - 1];
      expect(lastEvent.signal).toBe('phone_away');
    });

    it('sets signal to null when not provided', async () => {
      const run = await recordFocusRunEvent({
        eventType: 'clean_start',
        userId: 'user-1',
      });
      const lastEvent = run.events[run.events.length - 1];
      expect(lastEvent.signal).toBeNull();
    });
  });
});
