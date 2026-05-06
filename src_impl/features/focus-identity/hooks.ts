/**
 * Focus Identity React Hooks
 *
 * Custom hooks with loading states, error handling, and retry logic.
 * Provides clean interface for React components.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { FocusIdentityService, FocusIdentityEngine, FOCUS_SCORE_CONFIG } from "./FocusIdentityEngine";
import * as repository from "./repository";
import * as analytics from "./analytics";
import type { FocusIdentityProfile, ScoreBand } from "./FocusIdentityEngine";

// ============================================================================
// TYPES
// ============================================================================

type LoadingState = "idle" | "loading" | "success" | "error" | "retrying";

interface UseFocusIdentityReturn {
  profile: FocusIdentityProfile | null;
  loadingState: LoadingState;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;

  // Actions
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  updateScore: (eventType: string, sessionData?: { grade?: string; streakLength?: number }) => Promise<void>;
  retry: () => Promise<void>;

  // Derived state
  currentBand: ScoreBand | null;
  scoreChange: number;
  daysInCurrentBand: number;
  isInRecovery: boolean;
}

interface UseFocusScoreHistoryReturn {
  history: Array<{ date: string; score: number; reason: string }>;
  loadingState: LoadingState;
  error: Error | null;
  refresh: () => Promise<void>;
}

interface UseMonthlyReportReturn {
  report: {
    month: string;
    startingScore: number;
    endingScore: number;
    change: number;
    sessionsCompleted: number;
    grade: string;
    highlight: string;
  } | null;
  loadingState: LoadingState;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useFocusIdentity(userId: string | null): UseFocusIdentityReturn {
  const [profile, setProfile] = useState<FocusIdentityProfile | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const serviceRef = useRef<FocusIdentityService | null>(null);
  const engineRef = useRef<FocusIdentityEngine | null>(null);

  // Initialize service and engine
  useEffect(() => {
    if (userId) {
      serviceRef.current = new FocusIdentityService(userId);
      engineRef.current = new FocusIdentityEngine(userId);
    }
  }, [userId]);

  const initialize = useCallback(async () => {
    if (!userId || !serviceRef.current) {
      setLoadingState("error");
      setError(new Error("User ID required"));
      return;
    }

    setLoadingState("loading");
    setError(null);

    try {
      // Try to get from local storage first
      let profile = await serviceRef.current.getProfile();

      // If not found locally, try remote
      if (!profile) {
        const remoteProfile = await repository.getFocusProfile(userId);
        if (remoteProfile) {
          profile = remoteProfile;
        }
      }

      // If still not found, initialize new
      if (!profile) {
        profile = await serviceRef.current.initializeProfile();
        analytics.trackFocusIdentityCreated(userId, profile.currentScore, profile.band.label);
      }

      setProfile(profile);
      setLoadingState("success");
      setRetryCount(0);

      // Track analytics
      analytics.setFocusIdentityUserProperties(userId, profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to initialize"));
      setLoadingState("error");

      analytics.trackFocusIdentityError(userId, "initialization_failed", err instanceof Error ? err.message : "Unknown error", { retryCount });
    }
  }, [userId, retryCount]);

  const refresh = useCallback(async () => {
    if (!userId || !serviceRef.current) {
      return;
    }

    setLoadingState("loading");

    try {
      const profile = await serviceRef.current.getProfile();
      if (profile) {
        setProfile(profile);
        setLoadingState("success");
      } else {
        await initialize();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh"));
      setLoadingState("error");
    }
  }, [userId, initialize]);

  const updateScore = useCallback(
    async (eventType: string, sessionData?: { grade?: string; streakLength?: number }) => {
      if (!userId || !serviceRef.current || !profile) {
        return;
      }

      setLoadingState("loading");

      try {
        const result = await serviceRef.current.updateScore(eventType as keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES, sessionData);

        // Refresh profile
        const updatedProfile = await serviceRef.current.getProfile();
        if (updatedProfile) {
          setProfile(updatedProfile);

          // Track analytics
          analytics.trackFocusScoreUpdated(userId, profile.currentScore, result.newScore, result.change, updatedProfile.band.label, eventType, updatedProfile.isInRecovery);

          if (result.bandChanged) {
            analytics.trackScoreBandChange(userId, profile.band.label, updatedProfile.band.label, result.newScore);
          }
        }

        setLoadingState("success");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update score"));
        setLoadingState("error");

        analytics.trackFocusIdentityError(userId, "score_update_failed", err instanceof Error ? err.message : "Unknown error", { eventType, sessionData });
      }
    },
    [userId, profile],
  );

  const retry = useCallback(async () => {
    if (retryCount >= 3) {
      setError(new Error("Max retries exceeded"));
      setLoadingState("error");
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);
    setLoadingState("retrying");

    try {
      await initialize();
    } finally {
      setIsRetrying(false);
    }
  }, [initialize, retryCount]);

  // Auto-initialize on mount
  useEffect(() => {
    if (userId && loadingState === "idle") {
      initialize();
    }
  }, [userId, loadingState, initialize]);

  // Derived state
  const currentBand = profile?.band || null;
  const scoreChange = profile ? profile.currentScore - profile.previousScore : 0;
  const daysInCurrentBand = profile?.streakInCurrentBand || 0;
  const isInRecovery = profile?.isInRecovery || false;

  return {
    profile,
    loadingState,
    error,
    isRetrying,
    retryCount,
    initialize,
    refresh,
    updateScore,
    retry,
    currentBand,
    scoreChange,
    daysInCurrentBand,
    isInRecovery,
  };
}

// ============================================================================
// SCORE HISTORY HOOK
// ============================================================================

export function useFocusScoreHistory(userId: string | null, days: number = 90): UseFocusScoreHistoryReturn {
  const [history, setHistory] = useState<Array<{ date: string; score: number; reason: string }>>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoadingState("loading");
    setError(null);

    try {
      const data = await repository.getScoreHistory(userId, days);
      setHistory(data);
      setLoadingState("success");

      analytics.trackScoreHistoryViewed(userId, days);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch history"));
      setLoadingState("error");
    }
  }, [userId, days]);

  useEffect(() => {
    if (userId && loadingState === "idle") {
      refresh();
    }
  }, [userId, loadingState, refresh]);

  return { history, loadingState, error, refresh };
}

// ============================================================================
// MONTHLY REPORT HOOK
// ============================================================================

export function useMonthlyReport(userId: string | null): UseMonthlyReportReturn {
  const [report, setReport] = useState<UseMonthlyReportReturn["report"]>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoadingState("loading");

    try {
      const service = new FocusIdentityService(userId);
      const monthlyReport = await service.getMonthlyReport();

      if (monthlyReport) {
        setReport(monthlyReport);
      }

      setLoadingState("success");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch report"));
      setLoadingState("error");
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || loadingState !== "idle") {
      return;
    }

    refresh();
  }, [userId, loadingState, refresh]);

  return { report, loadingState, error, refresh };
}

// ============================================================================
// UTILITIES
// ============================================================================

export function useFocusScoreColor(score: number | null): string {
  if (score === null) {
    return "#9E9E9E";
  }

  if (score >= 800) {
    return "#FFD700";
  } // Legendary - Gold
  if (score >= 740) {
    return "#C0C0C0";
  } // Elite - Silver
  if (score >= 670) {
    return "#CD7F32";
  } // Exceptional - Bronze
  if (score >= 580) {
    return "#4CAF50";
  } // Strong - Green
  if (score >= 500) {
    return "#8BC34A";
  } // Good - Light Green
  if (score >= 420) {
    return "#FFC107";
  } // Fair - Amber
  return "#FF9800"; // Building - Orange
}

export function useIdentityStatement(band: ScoreBand | null, streakInBand: number): string {
  const statements: Record<string, string[]> = {
    Legendary: ["You are a Focus Virtuoso. Your discipline inspires others.", "Focus isn't just what you do—it's who you are.", "You're in the top 1%. Your commitment is legendary."],
    Elite: ["You are an Elite Performer. Excellence is your standard.", "Your focus habits are exceptional. Keep raising the bar.", "You're among the most disciplined people using this app."],
    Exceptional: ["You have Exceptional Focus. You're building something great.", "Your consistency is paying off. You're becoming unstoppable.", "You're in the top 15%. Your dedication shows."],
    Strong: ["You have Strong Focus. You're developing powerful habits.", "You're becoming the kind of person who follows through.", "Your momentum is building. Stay consistent."],
    Good: ["You have Good Focus. You're on the right path.", "You're building the habits that will change your life.", "Keep showing up. You're becoming more focused every day."],
    Fair: ["You're Developing Focus. Every session makes you stronger.", "Progress, not perfection. You're learning to be consistent.", "Your potential is there. Keep building the habit."],
    Building: ["You're Building Habits. Small steps lead to big changes.", "Everyone starts somewhere. Your journey is just beginning.", "Focus is a muscle. You're getting stronger with each session."],
  };

  if (!band) {
    return "Start your focus journey today.";
  }

  const bandStatements = statements[band.label];
  if (!bandStatements) {
    return "Keep building your focus habit.";
  }

  const index = Math.min(Math.floor(streakInBand / 7), bandStatements.length - 1);
  return bandStatements[index];
}
