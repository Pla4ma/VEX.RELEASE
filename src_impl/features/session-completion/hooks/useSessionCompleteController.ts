import { useMemo, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme';
import type { SessionSummary } from '../../../session/types';
import { buildSessionCompletionHero, buildSessionCompletionReturnPlan } from '../service';

export function useSessionCompleteController(input: {
  sessionId: string;
  summary: SessionSummary;
}) {
  const { sessionId, summary } = input;
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const scrollRef = useRef(null);

  const purityScore = summary.focusPurityScore ?? 0;
  const gradeLetter = purityScore >= 95
    ? 'S'
    : purityScore >= 85
      ? 'A'
      : purityScore >= 70
        ? 'B'
        : purityScore >= 55
          ? 'C'
          : 'D';

  const hero = buildSessionCompletionHero({
    focusedDurationLabel: `${Math.floor(summary.actualDuration / 60)} min focused`,
    interruptions: summary.interruptions,
    streakIncreased: summary.streakIncreased,
  });
  const returnPlan = buildSessionCompletionReturnPlan({
    completionPercentage: summary.completionPercentage,
    hasStudyFollowUp: false,
    streakDays: summary.streakDays,
    streakIncreased: summary.streakIncreased,
  });

  return useMemo(() => ({
    finishSession: () => navigation.navigate('Main' as never),
    focusedDuration: summary.actualDuration,
    formatDuration: (seconds: number) => `${Math.floor(seconds / 60)}m`,
    grade: { color: theme.colors.info.DEFAULT, label: `Grade ${gradeLetter}`, letter: gradeLetter },
    hero,
    navigation,
    purity: {
      color: theme.colors.success.DEFAULT,
      label: `${purityScore}% focus purity`,
    },
    focusPurityScore: purityScore,
    reflection: '',
    returnPlan,
    rewards: {
      actions: {
        setLevelUpCelebration: (
          _value: { newLevel: number; oldLevel: number; rewards: string[] } | null,
        ) => {},
      },
      chestResult: { coinReward: summary.coinsEarned, gemReward: summary.gemsEarned, xpReward: summary.xpEarned },
      levelUpCelebration: null as {
        newLevel: number;
        oldLevel: number;
        rewards: string[];
      } | null,
      showCtas: true,
    },
    scrollRef,
    selectedMood: null as string | null,
    setReflection: (_value: string) => {},
    setSelectedMood: (_value: string | null) => {},
    sessionId,
    theme,
    userId: summary.userId,
  }), [gradeLetter, hero, navigation, returnPlan, sessionId, summary, theme]);
}
