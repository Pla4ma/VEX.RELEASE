import React from 'react';
import type { HomeController } from './home-controller-types';
import type { ChallengeItem, SessionListItem } from '../../../features/home-spine/components';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';
import type { ToastOptions } from '../../../shared/ui/components/Toast';

export interface BaseHomeData {
  controller: HomeController;
  showToast: (opts: ToastOptions) => string;
  streakHoursRemaining: number | null;
  companionMood: string;
  hasActiveSession: boolean;
  resumeTimeSeconds: number | null;
  recentSessions: SessionListItem[];
  comebackSessionsCompleted: number;
  unreadNotificationCount: number;
  savedPreview: Record<string, unknown> | null;
  squadMembersFocusing: number | Array<Record<string, unknown>>;
  todaysChallenges: ChallengeItem[];
}

export interface NewUserHomeData extends BaseHomeData {
  intervention: null;
  interventionLoading: false;
  dismissIntervention: () => void;
  challengesQuery: {
    data: undefined;
    isLoading: false;
    isError: false;
    error: null;
    refetch: () => Promise<Record<string, never>>;
  };
  claimRewardMutation: { mutate: () => void; isPending: false };
  freezeStreakMutation: { mutate: () => void; isPending: false };
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  displayedInterventionIdRef: { current: null };
}

export interface ActivatingHomeData extends BaseHomeData {
  intervention: null;
  interventionLoading: false;
  dismissIntervention: () => void;
  challengesQuery: {
    data: undefined;
    isLoading: false;
    isError: false;
    error: null;
    refetch: () => Promise<Record<string, never>>;
  };
  claimRewardMutation: { mutate: () => void; isPending: false };
  freezeStreakMutation: { mutate: () => void; isPending: false };
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  displayedInterventionIdRef: { current: null };
}

export interface EngagedHomeData extends BaseHomeData {
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  dismissIntervention: (id: string) => void;
  challengesQuery: {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
  };
  claimRewardMutation: { mutate: (input: unknown, opts?: unknown) => unknown; isPending: boolean };
  freezeStreakMutation: { mutate: () => void; isPending: boolean };
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  displayedInterventionIdRef: React.MutableRefObject<string | null>;
}

export interface PowerUserHomeData extends BaseHomeData {
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  dismissIntervention: (id: string) => void;
  challengesQuery: {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
  };
  claimRewardMutation: { mutate: (input: unknown, opts?: unknown) => unknown; isPending: boolean };
  freezeStreakMutation: { mutate: () => void; isPending: boolean };
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  displayedInterventionIdRef: React.MutableRefObject<string | null>;
}
