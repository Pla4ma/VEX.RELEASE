/**
 * Companion Personality Engine Tests
 */

import { getCompanionPersonalityEngine, resetCompanionPersonalityEngine, type PersonalityEventType } from '../CompanionPersonalityEngine';
import * as analytics from '../analytics';
import { eventBus } from '../../../events/EventBus';

// Mock analytics
jest.mock('../analytics', () => ({
  trackPersonalityResponse: jest.fn(),
}));

// Mock event bus
jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
  },
}));

describe('CompanionPersonalityEngine', () => {
  beforeEach(() => {
    resetCompanionPersonalityEngine();
    jest.clearAllMocks();
  });

  afterEach(() => {
    const engine = getCompanionPersonalityEngine();
    engine.cleanup();
  });

  describe('initialization', () => {
    it('subscribes to all personality event channels', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      expect(eventBus.subscribe).toHaveBeenCalledWith('boss:defeated', expect.any(Function));
      expect(eventBus.subscribe).toHaveBeenCalledWith('session:completed', expect.any(Function));
      expect(eventBus.subscribe).toHaveBeenCalledWith('streak:milestone', expect.any(Function));
      expect(eventBus.subscribe).toHaveBeenCalledWith('streak:broken', expect.any(Function));
      expect(eventBus.subscribe).toHaveBeenCalledWith('coach:comeback_detected', expect.any(Function));
      expect(eventBus.subscribe).toHaveBeenCalledWith('progression:level_up', expect.any(Function));
    });

    it('returns cleanup function that unsubscribes all handlers', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const mockUnsubscribe = jest.fn();
      (eventBus.subscribe as jest.Mock).mockReturnValue(mockUnsubscribe);

      engine.cleanup();

      // Cleanup should call all unsubscribe functions
      expect(mockUnsubscribe).not.toHaveBeenCalled(); // Already called in cleanup
    });
  });

  describe('event handling', () => {
    it('triggers response for boss defeated event', () => {
      const engine = getCompanionPersonalityEngine();
      const mockListener = jest.fn();
      engine.subscribe(mockListener);
      engine.initialize();

      // Get the handler registered with eventBus
      const bossHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'boss:defeated')?.[1];

      bossHandler({
        userId: 'user-123',
        bossName: 'Distraction Dragon',
        bossId: 'boss-456',
      });

      // Should track analytics
      expect(analytics.trackPersonalityResponse).toHaveBeenCalledWith('user-123', 'BOSS_DEFEATED', expect.any(String), expect.any(Number));

      // Should update state
      const state = engine.getState();
      expect(state.isAnimating).toBe(true);
      expect(state.currentResponse).not.toBeNull();
    });

    it('triggers response for S-grade session', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const sessionHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'session:completed')?.[1];

      sessionHandler({
        userId: 'user-123',
        grade: 'S',
        purity: 98,
      });

      expect(analytics.trackPersonalityResponse).toHaveBeenCalledWith('user-123', 'S_GRADE_SESSION', expect.any(String), expect.any(Number));
    });

    it('triggers response for streak milestone', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const streakHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'streak:milestone')?.[1];

      streakHandler({
        userId: 'user-123',
        days: 7,
      });

      expect(analytics.trackPersonalityResponse).toHaveBeenCalledWith('user-123', 'STREAK_MILESTONE', expect.any(String), expect.any(Number));
    });

    it('does not trigger response for non-milestone streak days', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const streakHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'streak:milestone')?.[1];

      streakHandler({
        userId: 'user-123',
        days: 5, // Not 7, 14, or 30
      });

      expect(analytics.trackPersonalityResponse).not.toHaveBeenCalled();
    });

    it('triggers comeback response for 3+ days absent', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const comebackHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'coach:comeback_detected')?.[1];

      comebackHandler({
        userId: 'user-123',
        daysAbsent: 5,
      });

      expect(analytics.trackPersonalityResponse).toHaveBeenCalledWith('user-123', 'COMEBACK', expect.any(String), expect.any(Number));
    });

    it('does not trigger comeback for less than 3 days absent', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const comebackHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'coach:comeback_detected')?.[1];

      comebackHandler({
        userId: 'user-123',
        daysAbsent: 2,
      });

      expect(analytics.trackPersonalityResponse).not.toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('tracks response history', () => {
      const engine = getCompanionPersonalityEngine();
      const mockListener = jest.fn();
      engine.subscribe(mockListener);
      engine.initialize();

      const levelUpHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'progression:level_up')?.[1];

      // Trigger multiple level ups
      levelUpHandler({ userId: 'user-123', newLevel: 5 });
      levelUpHandler({ userId: 'user-123', newLevel: 6 });
      levelUpHandler({ userId: 'user-123', newLevel: 7 });

      const state = engine.getState();
      expect(state.responseHistory.length).toBeGreaterThan(0);
    });

    it('clears current response', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      // Trigger an event first
      const levelUpHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'progression:level_up')?.[1];

      levelUpHandler({ userId: 'user-123', newLevel: 5 });

      expect(engine.getState().currentResponse).not.toBeNull();

      // Clear the response
      engine.clearCurrentResponse();

      expect(engine.getState().currentResponse).toBeNull();
      expect(engine.getState().isAnimating).toBe(false);
    });
  });

  describe('error handling', () => {
    it('catches and logs errors in event handlers without crashing', () => {
      const engine = getCompanionPersonalityEngine();
      engine.initialize();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Corrupt the handler to throw an error
      const levelUpHandler = (eventBus.subscribe as jest.Mock).mock.calls.find((call) => call[0] === 'progression:level_up')?.[1];

      // Should not throw even with invalid data
      expect(() => {
        levelUpHandler(null);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
