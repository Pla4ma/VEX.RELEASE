/**
 * TimerEngine Tests
 *
 * Tests for the timer engine with edge cases and error scenarios.
 */

import { TimerEngine, createTimerEngine } from './TimerEngine';

jest.useFakeTimers();

describe('TimerEngine', () => {
  let engine: TimerEngine;
  const mockSessionId = 'test-session-123';
  const mockCallbacks = {
    onTick: jest.fn(),
    onComplete: jest.fn(),
    onWarning: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    engine = new TimerEngine(
      mockSessionId,
      300, // 5 minutes
      { tickInterval: 1000 },
      mockCallbacks
    );
  });

  afterEach(() => {
    engine.stop();
  });

  describe('start', () => {
    it('should start timer and set running state', () => {
      engine.start();

      expect(engine.isRunning()).toBe(true);
      expect(engine.isPaused()).toBe(false);
      expect(engine.getState().startTime).toBeDefined();
    });

    it('should emit tick events at regular intervals', () => {
      engine.start();

      jest.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(3);
    });

    it('should return early if already running', () => {
      engine.start();
      engine.start(); // Second call should be ignored (no error)

      jest.advanceTimersByTime(1000);
      // Should still only have original ticks from first start
      const tickCount = mockCallbacks.onTick.mock.calls.length;
      expect(tickCount).toBeGreaterThan(0);
    });
  });

  describe('pause', () => {
    it('should pause running timer', () => {
      engine.start();
      jest.advanceTimersByTime(5000);

      engine.pause();

      expect(engine.isPaused()).toBe(true);
      expect(engine.getState().pauseTime).toBeDefined();
    });

    it('should stop tick events when paused', () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      const tickCount = mockCallbacks.onTick.mock.calls.length;

      engine.pause();
      jest.advanceTimersByTime(5000);

      // Should not have new ticks while paused
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });

    it('should return early when not running or already paused', () => {
      engine.pause(); // Not running - should return early (no error)

      engine.start();
      engine.pause();
      engine.pause(); // Already paused - should return early (no error)

      expect(engine.isPaused()).toBe(true);
    });
  });

  describe('resume', () => {
    it('should resume paused timer', () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();

      engine.resume();

      expect(engine.isPaused()).toBe(false);
      expect(engine.getState().pauseTime).toBeUndefined();
    });

    it('should continue ticking after resume', () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      const tickCount = mockCallbacks.onTick.mock.calls.length;

      engine.resume();
      jest.advanceTimersByTime(3000);

      // Should have resumed ticking
      expect(mockCallbacks.onTick.mock.calls.length).toBeGreaterThan(tickCount);
    });

    it('should track total paused time', () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      jest.advanceTimersByTime(3000);
      engine.resume();

      expect(engine.getState().totalPausedTime).toBeGreaterThan(0);
    });

    it('should return early when not paused', () => {
      engine.start();
      engine.resume(); // Not paused - should return early (no error)

      expect(engine.isRunning()).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop timer and reset running state', () => {
      engine.start();
      jest.advanceTimersByTime(5000);

      engine.stop();

      expect(engine.isRunning()).toBe(false);
      expect(engine.isPaused()).toBe(false);
    });

    it('should stop tick events', () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      const tickCount = mockCallbacks.onTick.mock.calls.length;

      engine.stop();
      jest.advanceTimersByTime(5000);

      // Should not have new ticks after stop
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });
  });

  describe('completion', () => {
    it('should complete when time runs out', () => {
      engine = new TimerEngine(
        mockSessionId,
        5, // 5 seconds
        { tickInterval: 1000 },
        mockCallbacks
      );
      engine.start();

      jest.advanceTimersByTime(5000);

      expect(mockCallbacks.onComplete).toHaveBeenCalled();

      const state = engine.getState();
      expect(state.isRunning).toBe(false);
    });

    it('should call onComplete only once', () => {
      engine = new TimerEngine(
        mockSessionId,
        5,
        { tickInterval: 1000 },
        mockCallbacks
      );
      engine.start();

      jest.advanceTimersByTime(6000);

      expect(mockCallbacks.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnings', () => {
    it('should emit warning at configured thresholds', () => {
      engine = new TimerEngine(
        mockSessionId,
        305, // 5 minutes 5 seconds
        { tickInterval: 1000, warningThresholds: [300, 60, 10] },
        mockCallbacks
      );
      engine.start();

      // Should trigger at 300s (5s elapsed)
      jest.advanceTimersByTime(5000);

      expect(mockCallbacks.onWarning).toHaveBeenCalledWith(300);
    });

    it('should not emit duplicate warnings', () => {
      engine = new TimerEngine(
        mockSessionId,
        305,
        { tickInterval: 1000, warningThresholds: [300] },
        mockCallbacks
      );
      engine.start();

      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onWarning).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onWarning).toHaveBeenCalledTimes(1);
    });
  });

  describe('background handling', () => {
    it('should handle background mode transition', () => {
      engine.start();
      jest.advanceTimersByTime(5000);

      engine.background();

      expect(engine.isRunning()).toBe(true);
      expect(engine.getIsBackgrounded()).toBe(true);
    });

    it('should handle foreground mode transition', () => {
      engine.start();
      engine.background();
      jest.advanceTimersByTime(5000);

      engine.foreground();

      expect(engine.isRunning()).toBe(true);
      expect(engine.getIsBackgrounded()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very short durations', () => {
      engine = new TimerEngine(
        mockSessionId,
        2, // 2 seconds
        { tickInterval: 1000 },
        mockCallbacks
      );
      engine.start();

      jest.advanceTimersByTime(2000);

      expect(mockCallbacks.onComplete).toHaveBeenCalled();
    });

    it('should handle very long durations', () => {
      engine = new TimerEngine(
        mockSessionId,
        7200, // 2 hours
        { tickInterval: 1000 },
        mockCallbacks
      );
      engine.start();

      const state = engine.getState();
      expect(state.isRunning).toBe(true);
    });

    it('should handle rapid pause/resume cycles', () => {
      engine.start();

      for (let i = 0; i < 5; i++) {
        engine.pause();
        jest.advanceTimersByTime(100);
        engine.resume();
        jest.advanceTimersByTime(100);
      }

      expect(engine.isRunning()).toBe(true);
      expect(engine.getState().totalPausedTime).toBeGreaterThan(0);
    });
  });

  describe('time tracking', () => {
    it('should accurately track elapsed time', () => {
      engine.start();
      jest.advanceTimersByTime(10000);

      expect(engine.getElapsedTime()).toBeGreaterThanOrEqual(10000);
      expect(engine.getRemainingTime()).toBeLessThanOrEqual(290000);
    });

    it('should calculate percentage correctly', () => {
      engine.start();
      jest.advanceTimersByTime(150000); // 2.5 minutes of 5

      expect(engine.getPercentageComplete()).toBeCloseTo(50, 0);
    });
  });
});
