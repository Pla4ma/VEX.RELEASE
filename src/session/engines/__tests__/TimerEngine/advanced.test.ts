import { createEngine, mockCallbacks } from './helpers';
import type { TimerEngine } from './helpers';

describe('TimerEngine', () => {
  let engine: TimerEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    engine = createEngine();
  });

  afterEach(() => {
    engine.stop();
  });

  describe('completion', () => {
    it('should complete when time runs out', () => {
      engine = createEngine(5);
      engine.start();
      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
      const state = engine.getState();
      expect(state.isRunning).toBe(false);
    });

    it('should call onComplete only once', () => {
      engine = createEngine(5);
      engine.start();
      jest.advanceTimersByTime(6000);
      expect(mockCallbacks.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('warnings', () => {
    it('should emit warning at configured thresholds', () => {
      engine = createEngine(305, { tickInterval: 1000, warningThresholds: [300, 60, 10] });
      engine.start();
      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onWarning).toHaveBeenCalledWith(300);
    });

    it('should not emit duplicate warnings', () => {
      engine = createEngine(305, { tickInterval: 1000, warningThresholds: [300] });
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
      engine = createEngine(2);
      engine.start();
      jest.advanceTimersByTime(2000);
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
    });

    it('should handle very long durations', () => {
      engine = createEngine(7200);
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
      jest.advanceTimersByTime(150000);
      expect(engine.getPercentageComplete()).toBeCloseTo(50, 0);
    });
  });
});
