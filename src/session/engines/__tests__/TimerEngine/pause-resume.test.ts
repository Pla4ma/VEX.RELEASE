import { createEngine, mockCallbacks } from "./helpers";
import type { TimerEngine } from "./helpers";

describe("TimerEngine", () => {
  let engine: TimerEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    engine = createEngine();
  });

  afterEach(() => {
    engine.stop();
  });

  describe("pause", () => {
    it("should pause running timer", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      expect(engine.isPaused()).toBe(true);
      expect(engine.getState().pauseTime).toBeDefined();
    });

    it("should stop tick events when paused", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      const tickCount = mockCallbacks.onTick.mock.calls.length;
      engine.pause();
      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });

    it("should return early when not running or already paused", () => {
      engine.pause();
      engine.start();
      engine.pause();
      engine.pause();
      expect(engine.isPaused()).toBe(true);
    });
  });

  describe("resume", () => {
    it("should resume paused timer", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      engine.resume();
      expect(engine.isPaused()).toBe(false);
      expect(engine.getState().pauseTime).toBeUndefined();
    });

    it("should continue ticking after resume", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      const tickCount = mockCallbacks.onTick.mock.calls.length;
      engine.resume();
      jest.advanceTimersByTime(3000);
      expect(mockCallbacks.onTick.mock.calls.length).toBeGreaterThan(tickCount);
    });

    it("should track total paused time", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.pause();
      jest.advanceTimersByTime(3000);
      engine.resume();
      expect(engine.getState().totalPausedTime).toBeGreaterThan(0);
    });

    it("should return early when not paused", () => {
      engine.start();
      engine.resume();
      expect(engine.isRunning()).toBe(true);
    });
  });
});
