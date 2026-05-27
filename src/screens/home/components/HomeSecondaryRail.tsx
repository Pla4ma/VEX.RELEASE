import React from "react";
import { View } from "react-native";

import { PremiumSurface, SectionHeader } from "../../../components/premium";
import {
  getFeatureAvailability,
  type FeatureAccessMap,
  type UserExperienceStage,
} from "../../../features/liveops-config";
import type { SessionHistoryEntry } from "../../../session/types";
import type { LearningExecutionCopy } from "../../../features/learning-execution";
import {
  ContentStudyHeroCard,
  HistoryCard,
  RecentSessionsEmpty,
} from "../HomeScreenCards";
import { GoalCard } from "../HomeProgressiveBlocks";

interface HomeSecondaryRailProps {
  activePlan: {
    completedTasks: number;
    progressPercent: number;
    remainingMinutes: number;
    title: string;
    totalTasks: number;
  } | null;
  canShowSecondarySystems: boolean;
  comebackMessage: string | null;
  features: FeatureAccessMap;
  hasActiveRecommendation: boolean;
  hasStudyError: boolean;
  history: SessionHistoryEntry[];
  isFirstRun: boolean;
  isStudyLoading: boolean;
  learningCopy: LearningExecutionCopy;
  onContinueStudyPlan: () => void;
  onOpenProgress: () => void;
  onOpenSetup: () => void;
  onRetryStudyPlan: () => Promise<unknown>;
  onStartStudy: () => void;
  stage: UserExperienceStage;
}

export function HomeSecondaryRail({
  activePlan,
  canShowSecondarySystems,
  comebackMessage,
  features,
  hasActiveRecommendation,
  history,
  isFirstRun,
  hasStudyError,
  isStudyLoading,
  learningCopy,
  onContinueStudyPlan,
  onOpenProgress,
  onOpenSetup,
  onRetryStudyPlan,
  onStartStudy,
  stage,
}: HomeSecondaryRailProps): JSX.Element | null {
  const studyAvailability = getFeatureAvailability(features.content_study);

  if (!canShowSecondarySystems && !comebackMessage && hasActiveRecommendation) {
    return null;
  }

  return (
    <View style={{ gap: 16 }}>
      <SectionHeader
        eyebrow="Execution record"
        title="Keep the loop moving"
        body={`${learningCopy.layerName}, coaching, and progress stay tied to completed focus sessions.`}
      />
      {!hasActiveRecommendation ? <GoalCard stage={stage} /> : null}
      {studyAvailability.canRenderEntryPoint ? (
        <ContentStudyHeroCard
          activePlan={activePlan}
          hasError={hasStudyError}
          isLoading={isStudyLoading}
          copy={learningCopy}
          onContinue={onContinueStudyPlan}
          onRetry={() => void onRetryStudyPlan()}
          onSeeHowItWorks={onOpenProgress}
          onStart={onStartStudy}
        />
      ) : null}
      {canShowSecondarySystems ? (
        <View style={{ gap: 12 }}>
          <SectionHeader
            title="Recent Sessions"
            body="A compact snapshot of your last three focus wins."
          />
          {history.length === 0 ? (
            <RecentSessionsEmpty
              isFirstRun={isFirstRun}
              onStart={onOpenSetup}
            />
          ) : (
            history
              .slice(0, 3)
              .map((entry) => (
                <HistoryCard key={entry.sessionId} entry={entry} />
              ))
          )}
        </View>
      ) : null}
      {comebackMessage ? (
        <PremiumSurface
          actionLabel="Start session"
          body={comebackMessage}
          eyebrow="Coach"
          onAction={onOpenSetup}
          title="Comeback bonus active"
          tone="info"
        />
      ) : null}
    </View>
  );
}
