import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sessionComplete } from '../../../utils/haptics';
import {
  resolveCompletionExperiencePolicy,
} from '../../../features/session-completion/completion-experience-policy';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import { useTomorrowPreviewForSession } from '../../../features/home-spine/hooks';
import {
  useContractForSession,
  useReflectOnContract,
} from '../../../features/focus-contract/hooks';
import type { ReflectionStatus } from '../../../features/focus-contract/types';
import { saveTomorrowPreview } from '../../../features/home-spine/tomorrowPreviewService';
import { useFeatureAccess } from '../../../features/liveops-config';
import { useOnboardingStore } from '../../../features/onboarding/store';
import { usePremiumStatus } from '../../../shared/monetization/use-revenuecat';
import { FeatureUnlockCelebration } from '../../../features/session-completion/components/FeatureUnlockCelebration';

import { SessionCompleteOverlays } from './SessionCompleteOverlays';
import { SessionCompleteScrollView } from './SessionCompleteScrollView';
import {
  SESSION_MODE_TO_LANE,
  type SessionCompleteContentProps,
} from './SessionCompleteContent.types';

export function SessionCompleteContent({
  sessionId,
  summary,
  consequences,
}: SessionCompleteContentProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const [unlockFeatureIndex, setUnlockFeatureIndex] = useState(0);
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const controller = useSessionCompleteController({ sessionId, summary });
  const contractQuery = useContractForSession(sessionId);
  const featureAccess = useFeatureAccess();
  const motivationProfile = useOnboardingStore(
    (state) => state.motivationProfile,
  );
  const primaryGoal = useOnboardingStore((state) => state.goal);
  const premiumStatus = usePremiumStatus();
  const reflectContract = useReflectOnContract();

  const newlyUnlockedFeatures: string[] =
    consequences?.newlyUnlockedFeatures ?? [];

  useEffect(() => {
    if (gradeRevealed && newlyUnlockedFeatures.length > 0) {
      const timer = setTimeout(() => {
        setUnlockFeatureIndex(0);
        setShowUnlockCelebration(true);
      }, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gradeRevealed, newlyUnlockedFeatures.length]);

  const policy = resolveCompletionExperiencePolicy({
    consequences,
    featureAvailability: {
      boss: featureAccess.features.boss_tab.isVisible,
      challenges: featureAccess.features.challenges.isVisible,
      contractUsed: Boolean(contractQuery.contract),
      progress: featureAccess.features.progress_view.isVisible,
      study: featureAccess.features.content_study.isVisible,
    },
    firstWeekStage: featureAccess.stage,
    motivationStyle: motivationProfile?.primary ?? 'calm',
    premiumState: premiumStatus.isPremium ? 'premium' : 'free',
    primaryGoal,
    sessionMode: summary.sessionMode,
    summary,
  });

  const revealedGradeLetter =
    controller.grade.letter === 'F' ? 'D' : controller.grade.letter;

  const tomorrowPreview = useTomorrowPreviewForSession(
    controller.userId ?? '',
    {
      userId: controller.userId ?? '',
      currentStreakDays: summary.streakDays ?? 0,
      streakWillContinue: summary.streakMaintained,
      bossData: consequences?.boss
        ? {
            bossName: consequences.boss.bossName,
            healthPercent: consequences.boss.healthAfter,
            canDefeatTomorrow: consequences.boss.healthAfter <= 25,
          }
        : null,
    },
  );

  useEffect(() => {
    if (tomorrowPreview && controller.userId) {
      saveTomorrowPreview(controller.userId, tomorrowPreview);
    }
  }, [tomorrowPreview, controller.userId]);

  useEffect(() => {
    sessionComplete();
  }, []);

  const lane = useMemo(
    () => SESSION_MODE_TO_LANE[summary.sessionMode] ?? 'minimal_normal',
    [summary.sessionMode],
  );

  const handleGradeRevealComplete = useCallback(() => {
    setGradeRevealed(true);
  }, []);

  const handleReflectContract = useCallback(
    (status: ReflectionStatus) => {
      if (!contractQuery.contract) return;
      reflectContract.mutate({ contract: contractQuery.contract, status });
    },
    [contractQuery.contract, reflectContract],
  );

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={{
        backgroundColor: controller.theme.colors.background.primary,
        flex: 1,
      }}
    >
      {gradeRevealed ? (
        <SessionCompleteScrollView
          controller={controller}
          summary={summary}
          sessionId={sessionId}
          policy={policy}
          consequences={consequences}
          contract={contractQuery.contract}
          isContractPending={reflectContract.isPending}
          lane={lane}
          tomorrowPreview={tomorrowPreview}
          insets={insets}
          onReflectContract={handleReflectContract}
          onOpenReflection={() => bottomSheetRef.current?.snapToIndex(0)}
        />
      ) : null}

      <SessionCompleteOverlays
        controller={controller}
        summary={summary}
        gradeRevealed={gradeRevealed}
        revealedGradeLetter={revealedGradeLetter}
        onGradeRevealComplete={handleGradeRevealComplete}
        bottomSheetRef={bottomSheetRef}
      />

      {showUnlockCelebration &&
        newlyUnlockedFeatures.length > 0 &&
        newlyUnlockedFeatures[unlockFeatureIndex] ? (
        <FeatureUnlockCelebration
          featureKey={newlyUnlockedFeatures[unlockFeatureIndex]}
          onDismiss={() => {
            const nextIndex = unlockFeatureIndex + 1;
            if (nextIndex < newlyUnlockedFeatures.length) {
              setUnlockFeatureIndex(nextIndex);
            } else {
              setShowUnlockCelebration(false);
            }
          }}
        />
      ) : null}
    </Animated.View>
  );
}
