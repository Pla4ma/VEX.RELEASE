import {
  buildCoachPresence,
  buildCompletionCoachPresence,
  resolveCoachActionIntent,
} from '../service';

const unlockedAvailability = {
  canNavigate: true,
  canQuery: true,
  canRegisterRoute: true,
  canRenderEntryPoint: true,
  canShowNotification: true,
  canSubscribeToEvents: true,
  canUseBackend: true,
  reason: 'Ready',
  state: 'unlocked' as const,
};

const lockedAvailability = {
  ...unlockedAvailability,
  canNavigate: false,
  canQuery: false,
  canRegisterRoute: false,
  canRenderEntryPoint: false,
  canUseBackend: false,
  reason: 'Locked',
  state: 'locked' as const,
};

describe('CoachPresence service', () => {
  it('keeps companion reaction and coach copy aligned to calm motivation', () => {
    const presence = buildCoachPresence({
      companion: { element: 'WAVE', level: 3, mood: 'CONTENT', phase: 'YOUNG' },
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      memorySummary: { companionMemoryCount: 1, coachMemoryCount: 2, latestMemory: 'Clean starts work best.' },
      motivationStyle: 'CALM',
      progress: { currentStreakDays: 4, highFocusStreak: 2, totalSessions: 8 },
      surface: 'HOME',
    });

    expect(presence.tone.personality).toBe('steady');
    expect(presence.memoryConfidence).toBe('strong');
    expect(presence.message).toContain('usually');
    expect(presence.visualCompanionState.reaction).toBe('steady');
    expect(presence.nextAction.intent).toBe('START_SESSION');
  });

  it('uses study-focused copy and action when study is available', () => {
    const presence = buildCoachPresence({
      companion: null,
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      memorySummary: { companionMemoryCount: 0, coachMemoryCount: 0, latestMemory: null },
      motivationStyle: 'STUDY_FOCUSED',
      progress: { currentStreakDays: 1, highFocusStreak: 0, totalSessions: 2 },
      surface: 'HOME',
    });

    expect(presence.message).toContain('study block');
    expect(presence.memoryConfidence).toBe('weak');
    expect(presence.nextAction.intent).toBe('START_STUDY_SESSION');
  });

  it('supports friendly motivation as a warm unified coach presence', () => {
    const presence = buildCoachPresence({
      companion: { element: 'EMBER', level: 2, mood: 'READY', phase: 'YOUNG' },
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      memorySummary: { companionMemoryCount: 2, coachMemoryCount: 2, latestMemory: 'Morning starts have worked.' },
      motivationStyle: 'FRIENDLY',
      progress: { currentStreakDays: 1, highFocusStreak: 0, totalSessions: 3 },
      surface: 'HOME',
    });

    expect(presence.tone.personality).toBe('warm');
    expect(presence.visualCompanionState.reaction).toBe('focused');
    expect(presence.message).toContain('next block');
  });

  it('does not suggest locked study or progress actions', () => {
    expect(resolveCoachActionIntent({
      requestedIntent: 'START_STUDY_SESSION',
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: lockedAvailability },
    })).toBe('START_SESSION');

    expect(resolveCoachActionIntent({
      requestedIntent: 'REVIEW_PROGRESS',
      featureAvailability: { focus: unlockedAvailability, progress: lockedAvailability, study: unlockedAvailability },
    })).toBe('START_SESSION');
  });

  it('builds short completion reflection variants', () => {
    const reflection = buildCompletionCoachPresence({
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      memorySummary: { companionMemoryCount: 2, coachMemoryCount: 3, latestMemory: 'Short wins stack.' },
      motivationStyle: 'COACH_LED',
      summary: {
        durationMinutes: 12,
        focusPurityScore: 82,
        isComeback: true,
        isFirstSession: false,
        isHighFocusStreak: false,
        isLowEnergyDay: false,
        isStreakRecovery: false,
        sessionMode: 'SPRINT',
        streakDays: 1,
      },
    });

    expect(reflection.sessionReflection.length).toBeGreaterThan(0);
    expect(reflection.message.length).toBeLessThanOrEqual(96);
    expect(reflection.nextAction.intent).toBe('START_SESSION');
  });
});
