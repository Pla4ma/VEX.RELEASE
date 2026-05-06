import React from 'react';
import { View } from 'react-native';

import { Banner } from '../../../components/Banner';
import { PremiumSurface, SectionHeader } from '../../../components/premium';
import type { FeatureAccessMap } from '../../../features/liveops-config';
import type { UserExperienceStage } from '../../../features/liveops-config';
import type { SessionHistoryEntry } from '../../../session/types';
import { ContentStudyHeroCard, HistoryCard, RecentSessionsEmpty } from '../HomeScreenCards';
import { ComingSoonSection, GoalCard } from '../HomeProgressiveBlocks';

interface HomeSecondaryRailProps {
  activePlan: {
    completedTasks: number;
    progressPercent: number;
    remainingMinutes: number;
    title: string;
    totalTasks: number;
  } | null;
  battlePass: {
    currentTier?: number;
    xpToNextTier?: number;
  } | null;
  canShowExpansionSystems: boolean;
  canShowSecondarySystems: boolean;
  comebackMessage: string | null;
  features: FeatureAccessMap;
  hasActiveRecommendation: boolean;
  hasStudyError: boolean;
  history: SessionHistoryEntry[];
  isFirstRun: boolean;
  isStudyLoading: boolean;
  onContinueStudyPlan: () => void;
  onOpenProgress: () => void;
  onOpenSetup: () => void;
  onOpenSocial: () => void;
  onRetryStudyPlan: () => Promise<unknown>;
  onStartStudy: () => void;
  seasonIsVisible: boolean;
  socialSummary: string;
  stage: UserExperienceStage;
  wallet: {
    coins?: number;
    gems?: number;
  } | null;
}

export function HomeSecondaryRail({
  activePlan,
  battlePass,
  canShowExpansionSystems,
  canShowSecondarySystems,
  comebackMessage,
  features,
  hasActiveRecommendation,
  history,
  isFirstRun,
  hasStudyError,
  isStudyLoading,
  onContinueStudyPlan,
  onOpenProgress,
  onOpenSetup,
  onOpenSocial,
  onRetryStudyPlan,
  onStartStudy,
  seasonIsVisible,
  socialSummary,
  stage,
  wallet,
}: HomeSecondaryRailProps): JSX.Element | null {
  if (!canShowSecondarySystems && !canShowExpansionSystems && !comebackMessage && hasActiveRecommendation) {
    return null;
  }

  return (
    <View style={{ gap: 16 }}>
      <SectionHeader
        eyebrow="Secondary"
        title="More from VEX"
        body="Everything below supports the focus loop. Nothing here should compete with starting."
      />
      {!hasActiveRecommendation ? <GoalCard stage={stage} /> : null}
      {canShowSecondarySystems && features.economy_basic.isUnlocked ? (
        <PremiumSurface
          body="Session rewards land here first, then expand into protection, unlocks, and premium depth."
          eyebrow="Rewards"
          title={`${wallet?.coins ?? 0} coins${features.economy_advanced.isUnlocked ? ` • ${wallet?.gems ?? 0} gems` : ''}`}
          tone="info"
        />
      ) : null}
      {canShowExpansionSystems && features.content_study.isVisible ? (
        <ContentStudyHeroCard
          activePlan={activePlan}
          hasError={hasStudyError}
          isLoading={isStudyLoading}
          onContinue={onContinueStudyPlan}
          onRetry={() => void onRetryStudyPlan()}
          onSeeHowItWorks={onOpenProgress}
          onStart={onStartStudy}
        />
      ) : null}
      {canShowExpansionSystems && seasonIsVisible ? (
        <PremiumSurface
          body={`${battlePass?.xpToNextTier ?? 0} XP to the next tier.`}
          eyebrow="Season"
          title={`Tier ${battlePass?.currentTier ?? 0}`}
        />
      ) : null}
      {canShowSecondarySystems ? (
        <View style={{ gap: 12 }}>
          <SectionHeader
            title="Recent Sessions"
            body="A compact snapshot of your last three focus wins."
          />
          {history.length === 0 ? (
            <RecentSessionsEmpty isFirstRun={isFirstRun} onStart={onOpenSetup} />
          ) : (
            history.slice(0, 3).map((entry) => <HistoryCard key={entry.sessionId} entry={entry} />)
          )}
        </View>
      ) : null}
      {canShowExpansionSystems && features.social_tab.isVisible ? (
        <PremiumSurface
          actionLabel={features.social_tab.isUnlocked ? 'Open social' : 'Keep the core loop strong'}
          body={socialSummary}
          eyebrow="Accountability"
          onAction={onOpenSocial}
          title={features.social_tab.isUnlocked ? 'Your accountability layer is warming up' : 'Social arrives after your habit feels real'}
          tone={features.social_tab.isUnlocked ? 'default' : 'locked'}
        />
      ) : null}
      {!canShowSecondarySystems ? (
        <ComingSoonSection features={features} stage={stage} onPress={() => onOpenSetup()} />
      ) : null}
      {comebackMessage ? (
        <Banner
          description={comebackMessage}
          title="Comeback bonus active"
          variant="warning"
        />
      ) : null}
    </View>
  );
}
