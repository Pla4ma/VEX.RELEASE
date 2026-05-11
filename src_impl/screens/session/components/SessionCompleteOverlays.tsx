import React from 'react';
import { Modal } from 'react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import { LevelUpCelebration } from '../../../components/LevelUpCelebration';
import { GradeRevealAnimation } from '../../../features/session-completion/components/GradeRevealAnimation';
import { ContextualPaywallBanner } from '../../../shared/monetization/components/ContextualPaywallBanner';
import { SessionReflectionSheet } from './SessionReflectionSheet';
import { GRADE_REVEAL_COLORS } from '../../../features/session-completion/components/grade-reveal-helpers';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;

interface SessionCompleteOverlaysProps {
  controller: SessionCompleteController;
  summary: SessionSummary;
  gradeRevealed: boolean;
  revealedGradeLetter: string;
  onGradeRevealComplete: () => void;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

export function SessionCompleteOverlays({
  controller,
  summary,
  gradeRevealed,
  revealedGradeLetter,
  onGradeRevealComplete,
  bottomSheetRef,
}: SessionCompleteOverlaysProps): JSX.Element {
  return (
    <>
      {!gradeRevealed ? (
        <GradeRevealAnimation
          gradeColor={GRADE_REVEAL_COLORS[revealedGradeLetter] ?? controller.grade.color}
          gradeLetter={revealedGradeLetter}
          onComplete={onGradeRevealComplete}
        />
      ) : null}

      {gradeRevealed && controller.grade.letter === 'S' && (
        <ContextualPaywallBanner
          trigger="S_GRADE"
          bonusXp={Math.floor((controller.rewards.chestResult?.xpReward ?? summary.xpEarned) * 0.1)}
          onOpenPaywall={() =>
            controller.navigation.navigate('Paywall', {
              source: 's_grade_session',
              gatedFeature: 'xp_boost',
            })
          }
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
    </>
  );
}
