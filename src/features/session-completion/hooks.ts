import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../navigation/types';
import type { SessionSummary } from '../../session/types';
import type { MasteryState } from '../mastery/types';
import type { HeadlineReward } from './headline-reward.schemas';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { detectNewlyUnlockedFeatures } from './completion-personalization-step';
import * as Sentry from '@sentry/react-native';
import { repairPendingCompletion } from './completion-repair-service';
import { useCompletionRewardRepair } from './completion-repair-hook';
export { useRecoveredSessionCompletion } from './recovery-hooks';

type SessionNavigation = NativeStackNavigationProp<SessionStackParams>;
type RootNavigation = NativeStackNavigationProp<ExtendedRootStackParams>;
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


export function useCompletionSyncAutoRepair(input?: {
  isOnline?: boolean;
  userId?: string | null;
}): void {
  const lastRepairKey = useRef<string | null>(null);
  useEffect(() => {
    const repairKey = `${input?.userId ?? 'signed-out'}:${input?.isOnline ? 'online' : 'offline'}`;
    if (!input?.userId || !input.isOnline || lastRepairKey.current === repairKey) {
      return;
    }
    lastRepairKey.current = repairKey;
    void repairPendingCompletion({ userId: input.userId }).catch((error: unknown) => {
      Sentry.captureException(error, {
        tags: { feature: 'session-completion-auto-repair' },
      });
    });
  }, [input?.isOnline, input?.userId]);
}

export function useSessionCompleteController({
  summary,
  sessionId,
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
      applyChestRewards: (input: { sessionId: string; rewards: HeadlineReward[] }) => Promise<void>;
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
  const rootNavigation = navigation.getParent<RootNavigation>();
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const {
    applyCompletionRewards,
    rewardCreditError,
    rewardCreditStatus,
  } = useCompletionRewardRepair(userId, sessionId);
  const [completionStage, setCompletionStage] = useState(2);
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
      applyCompletionRewards,
      applyChestRewards: async (input: { sessionId: string; rewards: HeadlineReward[] }): Promise<void> => {
        if (input.rewards.length > 0) {
          throw new Error(`Unsupported chest rewards for session ${input.sessionId}`);
        }
        await applyCompletionRewards();
      },
      handleRevealComplete: () => setCompletionStage(2),
      setLevelUpCelebration,
    },
    completionStage,
    levelUpCelebration,
    rewardCreditError,
    rewardCreditStatus,
    showCtas: completionStage >= 2,
  }), [
    applyCompletionRewards,
    completionStage,
    levelUpCelebration,
    rewardCreditError,
    rewardCreditStatus,
  ]);

  return {
    finishSession: (_skipReflection?: boolean) => {
      if (rootNavigation) {
        rootNavigation.navigate('Main', { screen: 'Home' });
        return;
      }
      navigation.goBack();
    },
    grade,
    hero: {
      body: 'Your focus block is logged. XP, streak, and progress are tied to this completion.',
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
      returnReasonBody: 'Your session is saved. You can repair any delayed sync from this receipt.',
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
