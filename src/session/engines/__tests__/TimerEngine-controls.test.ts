import { createEngine, mockCallbacks } from './TimerEngine.helpers';

describe('TimerEngine', () => {
  let engine: ReturnType<typeof createEngine>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    engine = createEngine();
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
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(2000);
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(4);
    });

    it('should return early if already running', () => {
      engine.start();
      engine.start();
      jest.advanceTimersByTime(1000);
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
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });

    it('should return early when not running or already paused', () => {
      engine.pause();
      engine.start();
      engine.pause();
      engine.pause();
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
      engine.resume();
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
      expect(mockCallbacks.onTick).toHaveBeenCalledTimes(tickCount);
    });
  });
});
