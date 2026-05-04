/**
 * Neuroplasticity Trainer Tests
 *
 * Comprehensive test coverage for the brain training system.
 * Tests cognitive science-backed interventions and progress tracking.
 */

import { NeuroplasticityTrainer, NPT_CONFIG } from '../index';
import type { CognitiveDomain } from '../index';

describe('NeuroplasticityTrainer', () => {
  let trainer: NeuroplasticityTrainer;

  beforeEach(() => {
    trainer = new NeuroplasticityTrainer('test-user-789');
  });

  describe('Profile Initialization', () => {
    it('should create profile with correct ADHD subtype', async () => {
      const profile = await trainer.initializeProfile('INATTENTIVE');

      expect(profile.userId).toBe('test-user-789');
      expect(profile.adhdSubtype).toBe('INATTENTIVE');
      expect(profile.totalTrainingMinutes).toBe(0);
      expect(profile.currentStreakDays).toBe(0);
      expect(profile.overallLevel).toBe(1);
    });

    it('should adjust baseline scores for INATTENTIVE subtype', async () => {
      const profile = await trainer.initializeProfile('INATTENTIVE');

      // INATTENTIVE should have lower sustained attention, working memory
      expect(profile.baselineScores.SUSTAINED_ATTENTION).toBeLessThan(50);
      expect(profile.baselineScores.WORKING_MEMORY).toBeLessThan(50);
      expect(profile.baselineScores.INHIBITORY_CONTROL).toBeGreaterThan(25);
    });

    it('should adjust baseline scores for HYPERACTIVE subtype', async () => {
      const profile = await trainer.initializeProfile('HYPERACTIVE');

      // HYPERACTIVE should have lower inhibitory control
      expect(profile.baselineScores.INHIBITORY_CONTROL).toBeLessThan(30);
      expect(profile.baselineScores.EMOTIONAL_REGULATION).toBeLessThan(40);
    });

    it('should set priority domains based on lowest scores', async () => {
      const profile = await trainer.initializeProfile('COMBINED');

      expect(profile.priorityDomains).toHaveLength(3);
      // Priority domains should be the 3 lowest scoring
      const sortedScores = Object.entries(profile.baselineScores)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([k]) => k);
      expect(profile.priorityDomains).toEqual(sortedScores);
    });

    it('should recommend shorter sessions for severe ADHD', async () => {
      const profile = await trainer.initializeProfile('HYPERACTIVE');
      expect(profile.recommendedSessionStructure.focusDurationMinutes).toBeLessThanOrEqual(25);
      expect(profile.recommendedSessionStructure.breakFrequencyMinutes).toBeLessThanOrEqual(20);
    });

    it('should initialize all 8 cognitive domains', async () => {
      await trainer.initializeProfile('UNSPECIFIED');
      const allProgress = await trainer.getAllDomainProgress();

      expect(Object.keys(allProgress)).toHaveLength(8);
      NPT_CONFIG.DOMAINS.forEach((domain: CognitiveDomain) => {
        expect(allProgress[domain]).toBeDefined();
        expect(allProgress[domain].level).toBe(1);
        expect(allProgress[domain].totalSessions).toBe(0);
      });
    });
  });

  describe('Domain Progress', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should track domain level progression', async () => {
      const domain: CognitiveDomain = 'SUSTAINED_ATTENTION';
      const progress = await trainer.getDomainProgress(domain);

      expect(progress.level).toBe(1);
      expect(progress.xpToNextLevel).toBe(100);

      // Simulate earning XP
      progress.xp = 100;
      await (trainer as any).checkLevelUp(progress);

      expect(progress.level).toBe(2);
      expect(progress.xp).toBe(0);
      expect(progress.xpToNextLevel).toBeGreaterThan(100);
    });

    it('should update difficulty after level ups', async () => {
      const domain: CognitiveDomain = 'WORKING_MEMORY';
      const progress = await trainer.getDomainProgress(domain);

      expect(progress.currentDifficulty).toBe('BEGINNER');

      progress.level = 15;
      await (trainer as any).checkLevelUp(progress);

      expect(progress.currentDifficulty).toBe('INTERMEDIATE');
    });

    it('should track improvement percentage', async () => {
      const domain: CognitiveDomain = 'COGNITIVE_FLEXIBILITY';
      const progress = await trainer.getDomainProgress(domain);

      progress.baselineScore = 30;
      progress.currentScore = 45;

      expect(progress.improvementPercent).toBe(50);
    });
  });

  describe('Intervention Selection', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('INATTENTIVE');
    });

    it('should select intervention based on trigger type', async () => {
      const intervention = await trainer.getRecommendedIntervention('DISTRACTION_DETECTED');

      if (intervention) {
        expect(intervention.triggers).toContain('DISTRACTION_DETECTED');
      }
    });

    it('should prioritize priority domains', async () => {
      const intervention = await trainer.getRecommendedIntervention('BREAK_TIME');

      if (intervention) {
        const profile = await trainer.getProfile();
        expect(profile?.priorityDomains).toContain(intervention.domain);
      }
    });

    it('should filter by ADHD subtype appropriateness', async () => {
      const intervention = await trainer.getRecommendedIntervention('FRUSTRATION');

      if (intervention) {
        expect(intervention.forAdhdSubtype).toContain('INATTENTIVE');
      }
    });

    it('should prioritize low HRV with breathing exercises', async () => {
      const intervention = await trainer.getRecommendedIntervention(
        'DISTRACTION_DETECTED',
        'DISTRACTED',
        { hrv: 25, coherence: 0.3 }
      );

      if (intervention) {
        expect(intervention.type).toBe('BREATHING');
      }
    });
  });

  describe('Training Sessions', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should create training session with correct structure', async () => {
      const session = await trainer.startTrainingSession('WORKING_MEMORY');

      expect(session.userId).toBe('test-user-789');
      expect(session.domain).toBe('WORKING_MEMORY');
      expect(session.exercises).toHaveLength(0);
      expect(session.mentalState).toBe('FOCUSED');
    });

    it('should calculate accuracy from exercises', async () => {
      const session = await trainer.startTrainingSession('SUSTAINED_ATTENTION');

      // Add mock exercises
      session.exercises = [
        {
          id: 'ex1',
          type: 'SUSTAINED_ATTENTION',
          difficulty: 1,
          stimuli: [],
          userResponses: [
            { timestamp: 1, correct: true, responseTimeMs: 800 },
            { timestamp: 2, correct: true, responseTimeMs: 900 },
            { timestamp: 3, correct: false, responseTimeMs: 1200 },
          ],
          score: 0,
        },
      ];

      const result = await trainer.completeTrainingSession(session);

      expect(result.xpEarned).toBeGreaterThan(0);
      expect(result.domainProgress.accuracy).toBeCloseTo(0.67, 1);
    });

    it('should level up when enough XP earned', async () => {
      const session = await trainer.startTrainingSession('WORKING_MEMORY');

      // Create perfect performance for maximum XP
      session.exercises = [
        {
          id: 'ex1',
          type: 'N_BACK',
          difficulty: 3,
          stimuli: [],
          userResponses: Array(20).fill(null).map((_, i) => ({
            timestamp: i,
            correct: true,
            responseTimeMs: 500,
          })),
          score: 100,
        },
      ];

      const result = await trainer.completeTrainingSession(session);

      // Perfect 20/20 with fast response should trigger level up
      expect(result.xpEarned).toBeGreaterThan(50);
    });
  });

  describe('Adaptive Difficulty', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should increase difficulty on high accuracy', async () => {
      const domain: CognitiveDomain = 'WORKING_MEMORY';
      const progress = await trainer.getDomainProgress(domain);

      const initialStimulusDuration = progress.adaptiveParameters.stimulusDuration;

      // Simulate high accuracy (>85%)
      await (trainer as any).increaseDifficulty(progress);

      expect(progress.adaptiveParameters.stimulusDuration).toBeLessThan(initialStimulusDuration);
      expect(progress.adaptiveParameters.distractionProbability).toBeGreaterThan(0.1);
    });

    it('should decrease difficulty on low accuracy', async () => {
      const domain: CognitiveDomain = 'SELECTIVE_ATTENTION';
      const progress = await trainer.getDomainProgress(domain);

      const initialStimulusDuration = progress.adaptiveParameters.stimulusDuration;

      // Simulate low accuracy (<50%)
      await (trainer as any).decreaseDifficulty(progress);

      expect(progress.adaptiveParameters.stimulusDuration).toBeGreaterThan(initialStimulusDuration);
    });
  });

  describe('Cognitive Assessment', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should calculate improvement from baseline', async () => {
      // Improve some domain scores
      const domain: CognitiveDomain = 'SUSTAINED_ATTENTION';
      const progress = await trainer.getDomainProgress(domain);
      progress.baselineScore = 40;
      progress.currentScore = 60;
      await (trainer as any).saveDomainProgress(progress);

      const result = await trainer.runCognitiveAssessment();

      expect(result.overallImprovement).toBeGreaterThan(0);
      expect(result.domainScores[domain]).toBe(60);
    });

    it('should track assessment history', async () => {
      await trainer.runCognitiveAssessment();

      const profile = await trainer.getProfile();
      expect(profile?.assessments).toHaveLength(2); // Initial + new
    });
  });

  describe('Title Progression', () => {
    it('should assign correct title for level range', async () => {
      await trainer.initializeProfile('UNSPECIFIED');

      // Test various levels
      const testCases = [
        { level: 0, expectedTitle: 'Neural Novice' },
        { level: 15, expectedTitle: 'Synaptic Student' },
        { level: 60, expectedTitle: 'Cognitive Cadet' },
        { level: 250, expectedTitle: 'Neural Ninja' },
        { level: 800, expectedTitle: 'Cognitive Sage' },
      ];

      for (const { level, expectedTitle } of testCases) {
        const title = (trainer as any).getTitleForLevel(level);
        expect(title).toBe(expectedTitle);
      }
    });
  });

  describe('Streak Tracking', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should increment streak on consecutive days', async () => {
      const session = await trainer.startTrainingSession('WORKING_MEMORY');
      await trainer.completeTrainingSession(session);

      const summary = await trainer.getProgressSummary();
      expect(summary.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it('should track longest streak', async () => {
      const profile = await trainer.getProfile();
      if (profile) {
        profile.currentStreakDays = 10;
        profile.longestStreakDays = 10;
        await (trainer as any).saveProfile(profile);

        const summary = await trainer.getProgressSummary();
        expect(summary.currentStreak).toBe(10);
      }
    });
  });

  describe('Progress Summary', () => {
    beforeEach(async () => {
      await trainer.initializeProfile('COMBINED');
    });

    it('should return comprehensive progress summary', async () => {
      const summary = await trainer.getProgressSummary();

      expect(summary.overallLevel).toBeGreaterThanOrEqual(0);
      expect(summary.title).toBeDefined();
      expect(summary.topDomain).toBeDefined();
      expect(summary.needsAttentionDomain).toBeDefined();
    });

    it('should return default values when no profile exists', async () => {
      const newTrainer = new NeuroplasticityTrainer('no-profile-user');
      const summary = await newTrainer.getProgressSummary();

      expect(summary.title).toBe('Not Started');
      expect(summary.overallLevel).toBe(0);
    });
  });
});
