import { useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { SessionStackParams } from '../../navigation/types';
import type { SessionSummary } from '../../session/types';
import type { MasteryState } from '../mastery/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import { detectNewlyUnlockedFeatures } from './completion-personalization-step';

type SessionNavigation = NativeStackNavigationProp<SessionStackParams>;
type Mood = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'TERRIBLE';
type LevelUpCelebrationState = {
  oldLevel: number;
  newLevel: number;
  rewards: string[];
} | null;
type LevelMetric = {
  accent: string;
  id: string;
  label: string;
  progress: number;
  reward: string;
  value: string;
} | null;

export function useSessionCompletionConsequences(input?: {
  summary: SessionSummary;
  userId: string | null;
}): { newlyUnlockedFeatures: string[] } {
  return useMemo(() => {
    if (!input?.userId || !input?.summary) {
      return { newlyUnlockedFeatures: [] };
    }
    const features = detectNewlyUnlockedFeatures(input.userId, input.summary);
    return { newlyUnlockedFeatures: features };
  }, [input?.userId, input?.summary]);
}

export function useRecoveredSessionCompletion(_sessionId?: string | null): {
  data: null;
  error: null;
  isError: false;
  isPending: false;
  refetch: () => void;
} {
  return {
    data: null,
    error: null,
    isError: false,
    isPending: false,
    refetch: () => {},
  };
}

export function useCompletionSyncAutoRepair(_input?: {
  isOnline?: boolean;
  userId?: string | null;
}): void {}

export function useHomeReturnCompletionSync(): void {}

export function usePostSessionStoryViewModel(): null {
  return null;
}

export function useSessionHeadline(): null {
  return null;
}

export function useSessionRewardPriority(): null {
  return null;
}

export function useSessionCompleteController({
  summary,
}: {
  sessionId: string;
  summary: SessionSummary;
}): {
  finishSession: (_skipReflection?: boolean) => void;
  grade: { color: string; letter: string };
  hero: { body: string; eyebrow: string; title: string };
  levelMetric: LevelMetric;
  masteryState: MasteryState | null;
  navigation: SessionNavigation;
  nextAction: { ctaLabel: string; routeParams: Record<string, never> } | null;
  progressionError: null;
  progressionLoading: false;
  reflection: string;
  returnPlan: {
    homeCtaLabel: string;
    nextSessionLabel: string;
    returnReasonBody: string;
    returnReasonTitle: string;
  };
  rewards: {
    actions: {
      applyCompletionRewards: () => Promise<void>;
      handleRevealComplete: () => void;
      setLevelUpCelebration: React.Dispatch<React.SetStateAction<LevelUpCelebrationState>>;
    };
    completionStage: number;
    levelUpCelebration: LevelUpCelebrationState;
    rewardCreditError: string | null;
    rewardCreditStatus: 'idle' | 'success' | 'failed' | 'retrying' | 'crediting';
    showCtas: boolean;
  };
  scrollRef: React.MutableRefObject<null>;
  selectedMood: Mood | null;
  setMasteryState: React.Dispatch<React.SetStateAction<MasteryState | null>>;
  setReflection: React.Dispatch<React.SetStateAction<string>>;
  setSelectedMood: React.Dispatch<React.SetStateAction<Mood | null>>;
  studyProgress: null;
  theme: ReturnType<typeof useTheme>['theme'];
  userId: string;
} {
  const navigation = useNavigation<SessionNavigation>();
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [reflection, setReflection] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [masteryState, setMasteryState] = useState<MasteryState | null>(null);
  const [levelUpCelebration, setLevelUpCelebration] =
    useState<LevelUpCelebrationState>(null);

  const grade = useMemo(() => ({
    color: theme.colors.semantic.primary,
    letter: summary.finalScore >= 90 ? 'S' : summary.finalScore >= 75 ? 'A' : 'B',
  }), [summary.finalScore, theme.colors.semantic.primary]);

  const rewards = useMemo(() => ({
    actions: {
      applyCompletionRewards: async (): Promise<void> => {},
      handleRevealComplete: () => {},
      setLevelUpCelebration,
    },
    completionStage: 2,
    levelUpCelebration,
    rewardCreditError: null,
    rewardCreditStatus: 'idle' as const,
    showCtas: true,
  }), [levelUpCelebration]);

  return {
    finishSession: (_skipReflection?: boolean) => {
      navigation.navigate({ name: 'Home', params: {} });
    },
    grade,
    hero: {
      body: 'Your focus block is logged. Rewards are temporarily simplified while VEX rebuilds the completion details.',
      eyebrow: 'Session complete',
      title: grade.letter === 'S' ? 'Perfect pressure.' : 'Work locked in.',
    },
    levelMetric: null,
    masteryState,
    navigation,
    nextAction: null,
    progressionError: null,
    progressionLoading: false,
    reflection,
    returnPlan: {
      homeCtaLabel: 'Back home',
      nextSessionLabel: 'Start next session',
      returnReasonBody: 'Your session is saved. Rewards are degraded for now.',
      returnReasonTitle: 'Focus logged',
    },
    rewards,
    scrollRef,
    selectedMood,
    setMasteryState,
    setReflection,
    setSelectedMood,
    studyProgress: null,
    theme,
    userId: userId ?? '',
  };
}
