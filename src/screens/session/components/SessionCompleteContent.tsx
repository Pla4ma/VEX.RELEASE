import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Share, Platform, View, useWindowDimensions } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';

import { LevelUpCelebration } from '../../../components/LevelUpCelebration';
import { Box, Button, Text } from '../../../components/primitives';
import { sessionComplete } from '../../../utils/haptics';
import { GradeRevealAnimation } from '../../../features/session-completion/components/GradeRevealAnimation';
import { PerfectSessionBanner } from '../../../features/session-completion/components/PerfectSessionBanner';
import { XPEarnAnimation } from '../../../features/session-completion/components/XPEarnAnimation';
import { GRADE_REVEAL_COLORS } from '../../../features/session-completion/components/grade-reveal-helpers';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';
import { ChestRevealAnimationEnhanced, mapVariableRewardTier } from './ChestRevealAnimationEnhanced';
import { CompanionGrowthSection } from './CompanionGrowthSection';
import { SessionCompleteFooter } from './SessionCompleteFooter';
import { SessionCompletionRewardsSection } from './SessionCompletionRewardsSection';
import { SessionCompletionFollowThrough } from './SessionCompletionFollowThrough';
import { SessionGradeCard } from './SessionGradeCard';
import { SessionReflectionSheet } from './SessionReflectionSheet';
import { SessionReturnReasonCard } from './SessionReturnReasonCard';
import { SessionConsequenceCards, type SessionConsequenceCardsProps } from './SessionConsequenceCards';
import { TomorrowPreviewSession } from '../../../features/home-spine/components/TomorrowPreview';
import { useTomorrowPreviewForSession } from '../../../features/home-spine/hooks';
import { saveTomorrowPreview } from '../../../features/home-spine/tomorrowPreviewService';

// PHASE 17.2: VictoryCard imports for sharing
import { VictoryCard, type VictoryCardData, generateShareCaption } from '../../../features/social/components/VictoryCard';
// PHASE 18.3: Contextual paywall trigger
import { ContextualPaywallBanner } from '../../../shared/monetization/components/ContextualPaywallBanner';
// Neuroplasticity micro intervention
import { NeuroplasticityMicroInterventionCard } from '../../../features/neuroplasticity/components/NeuroplasticityMicroInterventionCard';

type SessionCompleteContentProps = {
  sessionId: string;
  summary: SessionSummary;
  /** PHASE 7.2: Session consequences to display */
  consequences?: {
    boss?: SessionConsequenceCardsProps['bossConsequence'];
    streak?: SessionConsequenceCardsProps['streakConsequence'];
    challenge?: SessionConsequenceCardsProps['challengeConsequence'];
    rival?: SessionConsequenceCardsProps['rivalConsequence'];
  };
};

export function SessionCompleteContent({
  sessionId,
  summary,
  consequences,
}: SessionCompleteContentProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { width } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const viewShotRef = useRef<View>(null);
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const [nptDone, setNptDone] = useState(false);
  const controller = useSessionCompleteController({ sessionId, summary });
  const revealedGradeLetter = controller.grade.letter === 'F' ? 'D' : controller.grade.letter;

  // Phase 5: Compute tomorrow preview based on session results
  const tomorrowPreview = useTomorrowPreviewForSession(
    controller.userId ?? '',
    {
      userId: controller.userId ?? '',
      currentStreakDays: summary.streakDays ?? 0,
      streakWillContinue: summary.streakMaintained,
      bossData: consequences?.boss ? {
        bossName: consequences.boss.bossName,
        healthPercent: consequences.boss.healthAfter,
        canDefeatTomorrow: consequences.boss.healthAfter <= 25,
      } : null,
    }
  );

  // Phase 5: Save tomorrow preview for Home screen display
  useEffect(() => {
    if (tomorrowPreview && controller.userId) {
      saveTomorrowPreview(controller.userId, tomorrowPreview);
    }
  }, [tomorrowPreview, controller.userId]);

  // Trigger session complete haptic on mount
  useEffect(() => {
    void sessionComplete();
  }, []);

  const handleGradeRevealComplete = useCallback(() => {
    setGradeRevealed(true);
  }, []);

  // PHASE 17.2: Session share handler
  const handleShareSession = useCallback(async () => {
    try {
      const shareMessage = generateShareCaption({
        type: 'SESSION',
        username: controller.userId || 'VEX User',
        timestamp: Date.now(),
        duration: Math.floor(controller.focusedDuration / 60),
        grade: controller.grade.letter,
        xp: summary.xpEarned,
        streakDays: summary.streakDays,
      } as VictoryCardData);

      await Share.share({
        message: shareMessage,
      });
    } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
      // Silent fail - don't disrupt the celebration
    }
  }, [controller.focusedDuration, controller.grade.letter, controller.userId, summary.streakDays, summary.xpEarned]);

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={{ backgroundColor: controller.theme.colors.background.primary, flex: 1 }}
    >
      {gradeRevealed ? (
        <>
          <ScrollView
            ref={controller.scrollRef}
            contentContainerStyle={{
              paddingBottom: controller.theme.spacing[20] + controller.theme.spacing[12],
              paddingTop: insets.top + controller.theme.spacing[5],
            }}
            showsVerticalScrollIndicator={false}
          >
            <Box px={6}>
              <Text variant="label" color={controller.theme.colors.primary[400]}>
                {controller.hero.eyebrow}
              </Text>
              <Text variant="h2" color={controller.theme.colors.text.primary} mt={2}>
                {controller.hero.title}
              </Text>
              <Text variant="body" color={controller.theme.colors.text.secondary} mt={2}>
                {controller.hero.body}
              </Text>
            </Box>

            <SessionGradeCard
              durationLabel={`${summary.interruptions} interruptions | ${controller.formatDuration(
                controller.focusedDuration,
              )}`}
              gradeColor={controller.grade.color}
              gradeLabel={controller.grade.label}
              gradeLetter={controller.grade.letter}
              purityColor={controller.purity.color}
              purityLabel={controller.purity.label}
              purityScore={controller.focusPurityScore}
              width={width}
              xpEarned={controller.rewards.chestResult?.xpReward ?? summary.xpEarned}
            />

            {/* Phase 9: Perfect Session Banner — shown for S grade, no pauses, 30+ min */}
            <PerfectSessionBanner isPerfect={summary.isPerfect ?? false} />

            {/* PHASE 7.2: Session Consequence Cards */}
            <SessionConsequenceCards
              bossConsequence={consequences?.boss}
              streakConsequence={consequences?.streak}
              challengeConsequence={consequences?.challenge}
              rivalConsequence={consequences?.rival}
            />

            {controller.rewards.revealStage >= 1 ? (
              <Box px={6}>
                <ChestRevealAnimationEnhanced
                  tier={mapVariableRewardTier(
                    (controller.rewards.chestResult?.tier?.toUpperCase() as import('../../../features/rewards/VariableRewardEngine').VariableRewardTier) ?? 'COMMON'
                  )}
                  rewards={{
                    xp: controller.rewards.chestResult?.xpReward ?? summary.xpEarned,
                    coins: controller.rewards.chestResult?.coinReward ?? 0,
                    gems: controller.rewards.chestResult?.gemReward ?? 0,
                  }}
                  onComplete={() => void controller.rewards.actions.handleRevealComplete()}
                  onOpenEarly={controller.rewards.actions.handleChestOpen}
                />
              </Box>
            ) : null}

            {controller.rewards.revealStage >= 2 ? (
              <>
                <Box px={6} pt={7}>
                  <XPEarnAnimation
                    levelProgress={controller.levelMetric?.progress ?? null}
                    summary={summary}
                    totalXp={controller.rewards.chestResult?.xpReward ?? summary.xpEarned}
                  />
                </Box>
                <SessionCompletionRewardsSection
                  levelMetric={controller.levelMetric}
                  masteryState={controller.masteryState}
                  progressionError={controller.progressionError}
                  progressionLoading={controller.progressionLoading}
                  rewards={controller.rewards}
                  setMasteryState={controller.setMasteryState}
                  studyProgress={controller.studyProgress}
                  summary={summary}
                  userId={controller.userId}
                  onStartNewSession={() =>
                    controller.navigation.navigate({ name: 'SessionSetup', params: {} })
                  }
                />
                <Box px={6}>
                  <CompanionGrowthSection
                    sessionId={sessionId}
                    summary={summary}
                    theme={controller.theme}
                    userId={controller.userId}
                  />
                </Box>

                {/* Neuroplasticity Micro Intervention */}
                {!nptDone && controller.userId && (
                  <NeuroplasticityMicroInterventionCard
                    userId={controller.userId}
                    sessionDurationSeconds={summary.effectiveDuration}
                    onComplete={() => setNptDone(true)}
                    onSkip={() => setNptDone(true)}
                  />
                )}

                <SessionCompletionFollowThrough summary={summary} />
              </>
            ) : null}

            {/* Phase 5: Tomorrow Preview — shows what happens next */}
            {tomorrowPreview && (
              <Box px={6} mt={8}>
                <TomorrowPreviewSession
                  preview={tomorrowPreview}
                  onPress={() => {
                    // Navigate to schedule or relevant screen
                    controller.navigation.navigate({ name: 'Home', params: {} });
                  }}
                />
              </Box>
            )}

            {/* PHASE 5: View Session Story — narrative recap of the session */}
            {controller.rewards.showCtas && (
              <Box px={6} mt={6}>
                <Button
                  variant="secondary"
                  onPress={() => navigation.navigate('PostSessionStory', { sessionId, summary })}
                  accessibilityLabel="View your session story"
                  accessibilityRole="button"
                >
                  View Session Story
                </Button>
              </Box>
            )}

            {controller.rewards.showCtas ? (
              <Box px={6} mt={8}>
                <SessionReturnReasonCard
                  body={controller.returnPlan.returnReasonBody}
                  theme={controller.theme}
                  title={controller.returnPlan.returnReasonTitle}
                />
              </Box>
            ) : null}
          </ScrollView>
          <SessionCompleteFooter
            bottomInset={Math.max(insets.bottom, controller.theme.spacing[4])}
            homeCtaLabel={controller.returnPlan.homeCtaLabel}
            nextSessionLabel={controller.returnPlan.nextSessionLabel}
            onOpenReflection={() => bottomSheetRef.current?.snapToIndex(0)}
            onStartNextSession={() =>
              controller.navigation.navigate({ name: 'SessionSetup', params: {} })
            }
            onShare={handleShareSession}
            showCtas={controller.rewards.showCtas}
            theme={controller.theme}
          />
        </>
      ) : null}

      {!gradeRevealed ? (
        <GradeRevealAnimation
          gradeColor={GRADE_REVEAL_COLORS[revealedGradeLetter] ?? controller.grade.color}
          gradeLetter={revealedGradeLetter}
          onComplete={handleGradeRevealComplete}
        />
      ) : null}

      {/* PHASE 18.3: Contextual paywall banner after S grade session */}
      {gradeRevealed && controller.grade.letter === 'S' && (
        <ContextualPaywallBanner
          trigger="S_GRADE"
          bonusXp={Math.floor((controller.rewards.chestResult?.xpReward ?? summary.xpEarned) * 0.1)}
          onOpenPaywall={() => navigation.navigate('Paywall', { source: 's_grade_session', gatedFeature: 'xp_boost' })}
        />
      )}

      <Modal
        transparent
        animationType="fade"
        statusBarTranslucent
        visible={Boolean(controller.rewards.levelUpCelebration)}
        onRequestClose={() => controller.rewards.actions.setLevelUpCelebration(null)}
      >
        {controller.rewards.levelUpCelebration ? (
          <LevelUpCelebration
            oldLevel={controller.rewards.levelUpCelebration.oldLevel}
            newLevel={controller.rewards.levelUpCelebration.newLevel}
            rewards={controller.rewards.levelUpCelebration.rewards}
            onDismiss={() => controller.rewards.actions.setLevelUpCelebration(null)}
          />
        ) : null}
      </Modal>

      <SessionReflectionSheet
        bottomSheetRef={bottomSheetRef}
        onFinish={() => controller.finishSession(false)}
        onSkip={() => controller.finishSession(true)}
        reflection={controller.reflection}
        selectedMood={controller.selectedMood}
        setReflection={controller.setReflection}
        setSelectedMood={controller.setSelectedMood}
      />
    </Animated.View>
  );
}
