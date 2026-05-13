import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Share, Platform, View, useWindowDimensions } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';

import { sessionComplete } from '../../../utils/haptics';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';
import { useTomorrowPreviewForSession } from '../../../features/home-spine/hooks';
import { saveTomorrowPreview } from '../../../features/home-spine/tomorrowPreviewService';
import { buildVictoryClipboardText, buildVictorySharePayload } from '../../../features/social/share';
import type { VictoryCard as VictoryCardType } from '../../../features/social/types';
const VictoryCard = ({ card }: { card: VictoryCardType }) => null;
type VictoryCardData = VictoryCardType;
const generateShareCaption = (card: VictoryCardType) => card.shareText;

import { SessionCompleteHeroSection } from './SessionCompleteHeroSection';
import { SessionCompleteRewardsPhase } from './SessionCompleteRewardsPhase';
import { SessionCompleteNextSteps } from './SessionCompleteNextSteps';
import { SessionCompleteOverlays } from './SessionCompleteOverlays';

type SessionCompleteContentProps = {
  sessionId: string;
  summary: SessionSummary;
  consequences?: {
    boss?: NonNullable<Parameters<typeof SessionCompleteHeroSection>[0]['consequences']>['boss'];
    streak?: NonNullable<Parameters<typeof SessionCompleteHeroSection>[0]['consequences']>['streak'];
    challenge?: NonNullable<Parameters<typeof SessionCompleteHeroSection>[0]['consequences']>['challenge'];
    rival?: NonNullable<Parameters<typeof SessionCompleteHeroSection>[0]['consequences']>['rival'];
  };
};

export function SessionCompleteContent({
  sessionId,
  summary,
  consequences,
}: SessionCompleteContentProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const viewShotRef = useRef<View>(null);
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const [nptDone, setNptDone] = useState(false);
  const controller = useSessionCompleteController({ sessionId, summary });
  const revealedGradeLetter = controller.grade.letter === 'F' ? 'D' : controller.grade.letter;

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
    }
  );

  useEffect(() => {
    if (tomorrowPreview && controller.userId) {
      saveTomorrowPreview(controller.userId, tomorrowPreview);
    }
  }, [tomorrowPreview, controller.userId]);

  useEffect(() => {
    void sessionComplete();
  }, []);

  const handleGradeRevealComplete = useCallback(() => {
    setGradeRevealed(true);
  }, []);

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
      } as unknown as VictoryCardData);

      await Share.share({ message: shareMessage });
    } catch (error) {
      captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
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
            <SessionCompleteHeroSection
              controller={controller}
              summary={summary}
              consequences={consequences}
            />

            <SessionCompleteRewardsPhase
              controller={controller}
              summary={summary}
              sessionId={sessionId}
              nptDone={nptDone}
              onNptDone={() => setNptDone(true)}
            />

            <SessionCompleteNextSteps
              controller={controller}
              summary={summary}
              sessionId={sessionId}
              tomorrowPreview={tomorrowPreview}
              bottomInset={Math.max(insets.bottom, controller.theme.spacing[4])}
              onShare={handleShareSession}
              onOpenReflection={() => bottomSheetRef.current?.snapToIndex(0)}
            />
          </ScrollView>
        </>
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
