import { describe, it, expect } from '@jest/globals';
import {
  resolveVexExperience,
  makeProfile,
  makeStats,
  defaultAvailability,
} from './personalization.helpers';

describe('Adaptive Study OS naming', () => {
  it('student user sees Study OS', () => {
    const profile = makeProfile({
      primaryGoal: 'study',
      motivationStyle: 'study_focused',
      studyLayerName: 'Study OS',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Study OS');
    expect(result.home.studyName).toBe('Study OS');
  });

  it('work user sees Deep Work Plan, never school wording', () => {
    const profile = makeProfile({
      primaryGoal: 'work',
      motivationStyle: 'coach_led',
      studyLayerName: 'Deep Work Plan',
    });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 5 }),
      { boss: true, challenges: true, premium: false, study: true },
    );
    expect(result.studyLayerLabel).toBe('Deep Work Plan');
    expect(result.home.studyName).toBe('Deep Work Plan');
    const joinedCopy = [result.home.coachCopy, result.home.studyName].join(' ');
    expect(joinedCopy.toLowerCase()).not.toMatch(/quiz|homework|chapter|study streak/i);
  });

  it('creative user sees Project Focus Path', () => {
    const profile = makeProfile({
      primaryGoal: 'creative',
      motivationStyle: 'friendly',
      studyLayerName: 'Project Focus Path',
      coachMode: 'mentor',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Project Focus Path');
    expect(result.home.studyName).toBe('Project Focus Path');
  });

  it('learning user sees Learning OS', () => {
    const profile = makeProfile({
      primaryGoal: 'learning',
      motivationStyle: 'study_focused',
      studyLayerName: 'Learning OS',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Learning OS');
    expect(result.home.studyName).toBe('Learning OS');
  });

  it('personal growth user sees Growth Path', () => {
    const profile = makeProfile({
      primaryGoal: 'personal',
      motivationStyle: 'calm',
      studyLayerName: 'Growth Path',
    });
    const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
    expect(result.studyLayerLabel).toBe('Growth Path');
    expect(result.home.studyName).toBe('Growth Path');
  });
});
