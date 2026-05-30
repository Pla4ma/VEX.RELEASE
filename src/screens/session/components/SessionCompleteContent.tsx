import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { sessionComplete } from "../../../utils/haptics";
import {
  type CompletionSurface,
  resolveCompletionExperiencePolicy,
} from "../../../features/session-completion/completion-experience-policy";
import { useSessionCompleteController } from "../../../features/session-completion/hooks";
import { useTomorrowPreviewForSession } from "../../../features/home-spine/hooks";
import {
  useContractForSession,
  useReflectOnContract,
} from "../../../features/focus-contract/hooks";
import type { ReflectionStatus } from "../../../features/focus-contract/types";
import { saveTomorrowPreview } from "../../../features/home-spine/tomorrowPreviewService";
import { useFeatureAccess } from "../../../features/liveops-config";
import { useOnboardingStore } from "../../../features/onboarding/store";
import { usePremiumStatus } from "../../../shared/monetization";
import { ModeCompletionSurface } from "../../../features/mode-native/components/ModeCompletionSurface";

import { SessionCompleteHeroSection } from "./SessionCompleteHeroSection";
import { SessionCompleteRewardsPhase } from "./SessionCompleteRewardsPhase";
import { SessionCompleteNextSteps } from "./SessionCompleteNextSteps";
import { SessionCompleteOverlays } from "./SessionCompleteOverlays";
import { SessionContractReflectionCard } from "./SessionContractReflectionCard";
import {
  SESSION_MODE_TO_LANE,
  type SessionCompleteContentProps,
} from "./SessionCompleteContent.types";

export function SessionCompleteContent({
  sessionId,
  summary,
  consequences,
}: SessionCompleteContentProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const controller = useSessionCompleteController({ sessionId, summary });
  const contractQuery = useContractForSession(sessionId);
  const featureAccess = useFeatureAccess();
  const motivationProfile = useOnboardingStore(
    (state) => state.motivationProfile,
  );
  const primaryGoal = useOnboardingStore((state) => state.goal);
  const premiumStatus = usePremiumStatus();
  const reflectContract = useReflectOnContract();
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
    motivationStyle: motivationProfile?.primary ?? "calm",
    premiumState: premiumStatus.isPremium ? "premium" : "free",
    primaryGoal,
    sessionMode: summary.sessionMode,
    summary,
  });
  const revealedGradeLetter =
    controller.grade.letter === "F" ? "D" : controller.grade.letter;
  const isHidden = useCallback(
    (surface: CompletionSurface) =>
      policy.hiddenCompletionSurfaces.includes(surface),
    [policy.hiddenCompletionSurfaces],
  );

  const tomorrowPreview = useTomorrowPreviewForSession(
    controller.userId ?? "",
    {
      userId: controller.userId ?? "",
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
    void sessionComplete();
  }, []);

  const lane = useMemo(
    () => SESSION_MODE_TO_LANE[summary.sessionMode] ?? "minimal_normal",
    [summary.sessionMode],
  );

  const handleGradeRevealComplete = useCallback(() => {
    setGradeRevealed(true);
  }, []);

  const handleReflectContract = useCallback(
    (status: ReflectionStatus) => {
      if (!contractQuery.contract) {
        return;
      }
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
        <ScrollView
          ref={controller.scrollRef}
          contentContainerStyle={{
            paddingBottom:
              controller.theme.spacing[20] + controller.theme.spacing[12],
            paddingTop: insets.top + controller.theme.spacing[5],
          }}
          showsVerticalScrollIndicator={false}
        >
          <SessionCompleteHeroSection
            controller={controller}
            summary={summary}
          />

          {!isHidden("contract_reflection_card") ? (
            <SessionContractReflectionCard
              contract={contractQuery.contract}
              isPending={reflectContract.isPending}
              onReflect={handleReflectContract}
            />
          ) : null}

          <ModeCompletionSurface
            lane={lane}
            topic={contractQuery.contract?.taskDescription}
            task={contractQuery.contract?.taskDescription}
            project={contractQuery.contract?.taskDescription}
            action={contractQuery.contract?.taskDescription}
            onPrimaryAction={() => {
              controller.navigation.navigate({ name: "Home", params: {} });
            }}
          />

          <SessionCompleteRewardsPhase
            controller={controller}
            summary={summary}
            sessionId={sessionId}
            policy={policy}
            consequences={consequences}
          />

          <SessionCompleteNextSteps
            controller={controller}
            tomorrowPreview={tomorrowPreview}
            bottomInset={Math.max(insets.bottom, controller.theme.spacing[4])}
            onShare={undefined}
            onOpenReflection={() => bottomSheetRef.current?.snapToIndex(0)}
          />
        </ScrollView>
      ) : null}

      <SessionCompleteOverlays
        controller={controller}
        summary={summary}
        gradeRevealed={gradeRevealed}
        revealedGradeLetter={revealedGradeLetter}
        onGradeRevealComplete={handleGradeRevealComplete}
        bottomSheetRef={bottomSheetRef}
      />
    </Animated.View>
  );
}
