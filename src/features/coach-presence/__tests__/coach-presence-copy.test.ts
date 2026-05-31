/**
 * Coach Presence — Copy Constants & Completion Message Tests
 */

import {
  BANNED_COACH_PHRASES,
  ACTION_LABELS,
  STYLE_ADAPTATION,
  FALLBACK_HOME_MESSAGES,
  PROGRESS_REACTIONS,
  getCompletionMessage,
} from '../copy';

describe('coach copy constants', () => {
  test('BANNED_COACH_PHRASES contains expected phrases', () => {
    expect(BANNED_COACH_PHRASES).toContain('Great job');
    expect(BANNED_COACH_PHRASES).toContain('Keep going');
    expect(BANNED_COACH_PHRASES.length).toBeGreaterThan(0);
  });

  test('ACTION_LABELS has a label for each intent', () => {
    expect(Object.keys(ACTION_LABELS)).toHaveLength(6);
    expect(ACTION_LABELS.START_SESSION).toBeTruthy();
    expect(ACTION_LABELS.TAKE_BREAK).toBeTruthy();
  });

  test('STYLE_ADAPTATION has an entry for each motivation style', () => {
    expect(Object.keys(STYLE_ADAPTATION)).toHaveLength(6);
    for (const style of ['CALM', 'FRIENDLY', 'COACH_LED', 'GAME_LIKE', 'INTENSE', 'STUDY_FOCUSED']) {
      expect(STYLE_ADAPTATION[style as keyof typeof STYLE_ADAPTATION]).toBeTruthy();
    }
  });

  test('FALLBACK_HOME_MESSAGES has entries for all styles', () => {
    expect(Object.keys(FALLBACK_HOME_MESSAGES)).toHaveLength(6);
  });

  test('PROGRESS_REACTIONS has entries for all styles', () => {
    expect(Object.keys(PROGRESS_REACTIONS)).toHaveLength(6);
  });

  test('no copy constant contains banned phrases', () => {
    const allMessages = [
      ...Object.values(FALLBACK_HOME_MESSAGES),
      ...Object.values(PROGRESS_REACTIONS),
      ...Object.values(STYLE_ADAPTATION),
    ];
    for (const msg of allMessages) {
      for (const banned of BANNED_COACH_PHRASES) {
        expect(msg).not.toContain(banned);
      }
    }
  });
});

describe('getCompletionMessage', () => {
  const baseSummary = {
    durationMinutes: 30,
    focusPurityScore: 80,
    isComeback: false,
    isFirstSession: false,
    isHighFocusStreak: false,
    isLowEnergyDay: false,
    isStreakRecovery: false,
    sessionMode: 'FOCUS',
    streakDays: 5,
  };

  test('returns first session message for first session', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, isFirstSession: true });
    expect(msg).toContain('First');
  });

  test('returns comeback message for comeback sessions', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, isComeback: true });
    expect(msg).toContain('return');
  });

  test('returns high focus streak message', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, isHighFocusStreak: true });
    expect(msg).toContain('rhythm');
  });

  test('returns low energy day message', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, isLowEnergyDay: true });
    expect(msg).toContain('Low-energy');
  });

  test('returns short session message for < 15 minutes', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, durationMinutes: 10 });
    expect(msg).toContain('Short');
  });

  test('returns long session message for >= 45 minutes', () => {
    const msg = getCompletionMessage('CALM', { ...baseSummary, durationMinutes: 60 });
    expect(msg).toContain('Long');
  });
});
