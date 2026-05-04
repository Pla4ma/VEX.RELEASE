/**
 * useNeuroplasticity Hook
 *
 * Main hook for neuroplasticity training with loading states, error handling, and retry logic.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NeuroplasticityTrainer } from '../NeuroplasticityTrainer';
import * as repository from '../repository';
import * as analytics from '../analytics';
import type { CognitiveDomain, DomainProgress, CognitiveProfile, MicroIntervention, TrainingSession } from '../NeuroplasticityTrainer';

type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'retrying';

// Type definitions based on NeuroplasticityTrainer types
type InterventionTrigger = 'DISTRACTION_DETECTED' | 'LOW_FOCUS' | 'FRUSTRATION' | 'BREAK_TIME' | 'USER_INITIATED';
type MentalState = 'FOCUSED' | 'DISTRACTED' | 'TIRED' | 'FRUSTRATED' | 'FLOW';

export interface UseNeuroplasticityReturn {
  profile: CognitiveProfile | null;
  allProgress: Record<CognitiveDomain, DomainProgress> | null;
  loadingState: LoadingState;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;

  // Actions
  initialize: (adhdSubtype: CognitiveProfile['adhdSubtype']) => Promise<void>;
  refresh: () => Promise<void>;
  startTrainingSession: (domain: CognitiveDomain) => Promise<string | null>;
  completeTrainingSession: (sessionId: string, accuracy: number, durationSeconds: number) => Promise<void>;
  getIntervention: (trigger: InterventionTrigger, mentalState?: MentalState) => Promise<MicroIntervention | null>;
  recordIntervention: (interventionId: string, completed: boolean, effectiveness: 1 | 2 | 3 | 4 | 5) => Promise<void>;
  retry: () => Promise<void>;

  // Derived state
  overallLevel: number;
  title: string;
  currentStreak: number;
  strongestDomain: CognitiveDomain | null;
  weakestDomain: CognitiveDomain | null;
}

export function useNeuroplasticity(userId: string | null): UseNeuroplasticityReturn {
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [allProgress, setAllProgress] = useState<Record<CognitiveDomain, DomainProgress> | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const trainerRef = useRef<NeuroplasticityTrainer | null>(null);
  const activeSessions = useRef<Map<string, { domain: CognitiveDomain; startedAt: number }>>(new Map());

  useEffect(() => {
    if (userId) {
      trainerRef.current = new NeuroplasticityTrainer(userId);
    }
  }, [userId]);

  const initialize = useCallback(async (adhdSubtype: CognitiveProfile['adhdSubtype']) => {
    if (!userId || !trainerRef.current) {
      setLoadingState('error');
      setError(new Error('User ID required'));
      return;
    }

    setLoadingState('loading');
    setError(null);

    try {
      // Try local first, then remote
      let profile = await trainerRef.current.getProfile();
      let progress = await trainerRef.current.getAllDomainProgress();

      // If not found locally, check remote
      if (!profile) {
        const remoteProfile = await repository.getNptProfile(userId);
        if (remoteProfile) {
          profile = remoteProfile;
        }
      }

      // If still not found, initialize new
      if (!profile) {
        profile = await trainerRef.current.initializeProfile(adhdSubtype);
        progress = await trainerRef.current.getAllDomainProgress();

        analytics.trackNptProfileCreated(
          userId,
          adhdSubtype,
          profile.priorityDomains,
          profile.overallLevel
        );
        analytics.trackNptFunnel(userId, 'profile_created');
      }

      setProfile(profile);
      setAllProgress(progress);
      setLoadingState('success');
      setRetryCount(0);

      // Set analytics user properties
      if (progress) {
        analytics.trackNptUserProperties(userId, profile, progress);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize'));
      setLoadingState('error');

      analytics.trackNptError(userId, 'initialization_failed',
        err instanceof Error ? err.message : 'Unknown error',
        { retryCount }
      );
    }
  }, [userId, retryCount]);

  const refresh = useCallback(async () => {
    if (!userId || !trainerRef.current) {return;}

    setLoadingState('loading');

    try {
      const [profile, progress] = await Promise.all([
        trainerRef.current.getProfile(),
        trainerRef.current.getAllDomainProgress(),
      ]);

      if (profile) {
        setProfile(profile);
        setAllProgress(progress);
        setLoadingState('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh'));
      setLoadingState('error');
    }
  }, [userId]);

  const startTrainingSession = useCallback(async (domain: CognitiveDomain): Promise<string | null> => {
    if (!userId || !trainerRef.current) {return null;}

    try {
      const progress = allProgress?.[domain];
      const session = await trainerRef.current.startTrainingSession(domain);

      activeSessions.current.set(session.id, { domain, startedAt: Date.now() });

      analytics.trackTrainingSessionStarted(
        userId,
        domain,
        progress?.level || 1,
        progress?.currentDifficulty || 'BEGINNER'
      );

      return session.id;
    } catch (err) {
      analytics.trackNptError(userId, 'session_start_failed',
        err instanceof Error ? err.message : 'Unknown error',
        { domain }
      );
      return null;
    }
  }, [userId, allProgress]);

  const completeTrainingSession = useCallback(async (
    sessionId: string,
    accuracy: number,
    durationSeconds: number
  ) => {
    if (!userId || !trainerRef.current) {return;}

    const sessionInfo = activeSessions.current.get(sessionId);
    if (!sessionInfo) {return;}

    setLoadingState('loading');

    try {
      // Create complete session object
      const session: TrainingSession = {
        id: sessionId,
        userId,
        domain: sessionInfo.domain,
        startedAt: sessionInfo.startedAt,
        endedAt: Date.now(),
        accuracy,
        xpEarned: Math.round(accuracy * 50), // Approximate XP calculation
        levelUp: false,
        exercises: [],
        averageResponseTime: 0,
        mentalState: 'FOCUSED',
      };

      const result = await trainerRef.current.completeTrainingSession(session);

      // Refresh data
      const [updatedProfile, updatedProgress] = await Promise.all([
        trainerRef.current.getProfile(),
        trainerRef.current.getAllDomainProgress(),
      ]);

      setProfile(updatedProfile);
      setAllProgress(updatedProgress);
      setLoadingState('success');

      // Track analytics
      analytics.trackTrainingSessionCompleted(
        userId,
        sessionInfo.domain,
        accuracy,
        result.xpEarned,
        result.levelUp,
        updatedProfile?.overallLevel || 1,
        durationSeconds
      );

      if (result.levelUp) {
        analytics.trackNptFunnel(userId, 'first_level_up');
      }

      // Clean up
      activeSessions.current.delete(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete session'));
      setLoadingState('error');

      analytics.trackNptError(userId, 'session_complete_failed',
        err instanceof Error ? err.message : 'Unknown error',
        { sessionId, accuracy }
      );
    }
  }, [userId]);

  const getIntervention = useCallback(async (
    trigger: InterventionTrigger,
    mentalState?: MentalState
  ): Promise<MicroIntervention | null> => {
    if (!userId || !trainerRef.current) {return null;}

    try {
      const intervention = await trainerRef.current.getRecommendedIntervention(
        trigger,
        mentalState
      );

      if (intervention) {
        analytics.trackInterventionTriggered(
          userId,
          intervention.id,
          intervention.domain,
          trigger,
          mentalState
        );
      }

      return intervention;
    } catch (err) {
      analytics.trackNptError(userId, 'intervention_get_failed',
        err instanceof Error ? err.message : 'Unknown error',
        { trigger, mentalState }
      );
      return null;
    }
  }, [userId]);

  const recordIntervention = useCallback(async (
    interventionId: string,
    completed: boolean,
    effectiveness: 1 | 2 | 3 | 4 | 5
  ) => {
    if (!userId || !trainerRef.current) {return;}

    try {
      await trainerRef.current.recordIntervention(interventionId, completed, effectiveness);

      // Refresh progress
      const progress = await trainerRef.current.getAllDomainProgress();
      setAllProgress(progress);

      analytics.trackInterventionCompleted(
        userId,
        interventionId,
        'WORKING_MEMORY', // Domain would come from intervention lookup
        completed,
        effectiveness,
        0 // Duration would be tracked separately
      );
    } catch (err) {
      analytics.trackNptError(userId, 'intervention_record_failed',
        err instanceof Error ? err.message : 'Unknown error',
        { interventionId, completed, effectiveness }
      );
    }
  }, [userId]);

  const retry = useCallback(async () => {
    if (retryCount >= 3) {
      setError(new Error('Max retries exceeded'));
      setLoadingState('error');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setLoadingState('retrying');

    // Retry with increasing delay
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));

    try {
      await refresh();
    } finally {
      setIsRetrying(false);
    }
  }, [refresh, retryCount]);

  // Derived state
  const overallLevel = profile?.overallLevel || 0;
  const title = profile?.title || 'Neural Novice';
  const currentStreak = profile?.currentStreakDays || 0;

  const { strongestDomain, weakestDomain } = useMemo(() => {
    if (!allProgress) {return { strongestDomain: null, weakestDomain: null };}

    const entries = Object.entries(allProgress);
    if (entries.length === 0) {return { strongestDomain: null, weakestDomain: null };}

    const sorted = entries.sort((a, b) => b[1].level - a[1].level);

    return {
      strongestDomain: sorted[0][0] as CognitiveDomain,
      weakestDomain: sorted[sorted.length - 1][0] as CognitiveDomain,
    };
  }, [allProgress]);

  return {
    profile,
    allProgress,
    loadingState,
    error,
    isRetrying,
    retryCount,
    initialize,
    refresh,
    startTrainingSession,
    completeTrainingSession,
    getIntervention,
    recordIntervention,
    retry,
    overallLevel,
    title,
    currentStreak,
    strongestDomain,
    weakestDomain,
  };
}
