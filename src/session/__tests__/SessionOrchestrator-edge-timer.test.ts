import { SessionOrchestrator } from '../SessionOrchestrator';
import {
  mockConfig,
  createOrchestrator,
  TEST_USER_ID,
} from './SessionOrchestrator.helpers';
import type { SessionConfig } from '../types';

describe('SessionOrchestrator', () => {
  let orchestrator: SessionOrchestrator;
  beforeEach(() => {
    orchestrator = createOrchestrator();
  });
  afterEach(() => {
    orchestrator.destroy();
  });

  describe('Edge Cases and Error Handling', () => {
    it('should throw error when creating session without user', async () => {
      const orphanOrchestrator = new SessionOrchestrator();
      await expect(
        orphanOrchestrator.createSession(mockConfig),
      ).rejects.toThrow('No user set');
      orphanOrchestrator.destroy();
    });

    it('should handle rapid pause/resume cycles', async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      for (let i = 0; i < 5; i++) {
        await orchestrator.pauseSession();
        await orchestrator.resumeSession();
      }
      const session = orchestrator.getSession();
      expect(session?.pauses).toBe(5);
      expect(session?.status).toBe('ACTIVE');
    });

    it('should handle background/foreground cycles', async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      for (let i = 0; i < 3; i++) {
        await orchestrator.backgroundSession();
        await orchestrator.foregroundSession();
      }
      const session = orchestrator.getSession();
      expect(session?.status).toBe('ACTIVE');
    });

    it('should maintain session integrity during operations', async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      await orchestrator.pauseSession();
      await orchestrator.resumeSession();
      await orchestrator.backgroundSession();
      await orchestrator.foregroundSession();
      const session = orchestrator.getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(TEST_USER_ID);
      expect(session?.config.duration).toBe(mockConfig.duration);
    });
  });

  describe('Timer State', () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it('should provide timer state', () => {
      const timerState = orchestrator.getTimerState();
      expect(timerState).not.toBeNull();
      expect(timerState?.isRunning).toBe(true);
    });

    it('should track remaining seconds', () => {
      const remaining = orchestrator.getRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(mockConfig.duration);
    });

    it('should track elapsed seconds', async () => {
      const elapsedBefore = orchestrator.getElapsedSeconds();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const elapsedAfter = orchestrator.getElapsedSeconds();
      expect(elapsedAfter).toBeGreaterThanOrEqual(elapsedBefore);
    });
  });

  describe('Multi-Interval Sessions', () => {
    const multiIntervalConfig: SessionConfig = {
      ...mockConfig,
      duration: 30,
      intervals: 4,
      longBreakInterval: 2,
      breakDuration: 5,
      longBreakDuration: 10,
    };

    it('should create multi-interval session', async () => {
      const session = await orchestrator.createSession(multiIntervalConfig);
      expect(session.totalIntervals).toBe(4);
      expect(session.currentInterval).toBe(1);
      expect(session.intervalsCompleted).toBe(0);
    });
  });
});

describe('SessionOrchestrator Integration', () => {
  let orchestrator: SessionOrchestrator;
  beforeEach(() => {
    orchestrator = createOrchestrator({ enableAntiCheat: true });
  });
  afterEach(() => {
    orchestrator.destroy();
  });

  it('should complete full session lifecycle', async () => {
    const session = await orchestrator.createSession(mockConfig);
    expect(session.status).toBe('PREPARING');
    await orchestrator.startSession(0);
    expect(orchestrator.getSession()?.status).toBe('ACTIVE');
    await orchestrator.pauseSession();
    expect(orchestrator.getSession()?.status).toBe('PAUSED');
    await orchestrator.resumeSession();
    expect(orchestrator.getSession()?.status).toBe('ACTIVE');
    await orchestrator.abandonSession('test complete');
    expect(orchestrator.getSession()?.status).toBe('ABANDONED');
    expect(orchestrator.isSessionActive()).toBe(false);
  });

  it('should handle concurrent state changes', async () => {
    await orchestrator.createSession(mockConfig);
    await orchestrator.startSession(0);
    const operations = [
      orchestrator.pauseSession(),
      orchestrator.backgroundSession(),
    ];
    await Promise.all(operations);
    const session = orchestrator.getSession();
    expect(['PAUSED', 'BACKGROUNDED']).toContain(session?.status);
  });
});
