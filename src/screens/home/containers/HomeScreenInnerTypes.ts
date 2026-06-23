import type React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks/useActiveIntervention';
import type {
  ChallengeItem,
  SessionListItem,
} from '../../../features/home-spine/components';
import type { ToastOptions } from '../../../shared/ui/components/Toast';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CoachAgentDecision } from '../../../features/invisible-agent';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export interface HomeDataProps {
  controller: HomeController;
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  dismissIntervention: (id: string) => void;
  showToast: (opts: ToastOptions) => string;
  streakHoursRemaining: number | null;
  companionMood: string;
  unreadNotificationCount: number;
  todaysChallenges: ChallengeItem[];
  recentSessions: SessionListItem[];
  comebackSessionsCompleted: number;
  hasActiveSession: boolean;
  resumeTimeSeconds: number | null;
  savedPreview: Record<string, unknown> | null;
  squadMembersFocusing: number | Array<Record<string, unknown>>;
  handleClaimReward: (id: string) => void;
  handleFreezeStreak: () => void;
  challengesQuery: {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
  };
  claimRewardMutation: {
    mutate: (input: unknown, opts?: unknown) => unknown;
    isPending: boolean;
  };
  freezeStreakMutation: {
    mutate: (input: unknown, opts?: unknown) => unknown;
    isPending: boolean;
  };
  displayedInterventionIdRef: React.MutableRefObject<string | null>;
  invisibleAgentQuery?: UseQueryResult<CoachAgentDecision>;
}

export interface HomeScreenInnerProps {
  model: HomeViewModel & { controller: HomeController };
  data: HomeDataProps;
}

export type { Nav };
