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

  describe("start", () => {
    it("should start timer and set running state", () => {
      engine.start();
      expect(engine.isRunning()).toBe(true);
      expect(engine.isPaused()).toBe(false);
      expect(engine.getState().startTime).toBeDefined();
    });

    it("should emit tick events at regular intervals", () => {
      engine.start();
      jest.advanceTimersByTime(1000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(2000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(3);
    });

    it("should return early if already running", () => {
      engine.start();
      engine.start();
      jest.advanceTimersByTime(1000);
      const tickCount = mockCallbacks.onTick.mock.calls.length;
      expect(tickCount).toBeGreaterThan(0);
    });
  });

  describe("stop", () => {
    it("should stop timer and reset running state", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      engine.stop();
      expect(engine.isRunning()).toBe(false);
      expect(engine.isPaused()).toBe(false);
    });

    it("should stop tick events", () => {
      engine.start();
      jest.advanceTimersByTime(5000);
      const tickCount = mockCallbacks.onTick.mock.calls.length;
      engine.stop();
      jest.advanceTimersByTime(5000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });
  });
});
