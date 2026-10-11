import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../../components/glass/GlassScreen';
import { SessionStartStatusCard } from '../../../features/session-start/components/SessionStartStatusCard';
import type { SessionDifficulty } from '../../../features/session-start/components/DifficultySelector';
import { useSessionStartController } from '../../../features/session-start/hooks';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import type { ActiveStudyPlan } from '../../../features/content-study/hooks';
import { buildLearningSessionParams } from '../../../features/learning-execution/service';
import { SessionMode } from '../../../session/modes';
import { SessionComposerView } from './SessionComposerView';
import { SessionSetupAtmosphere } from './SessionSetupAtmosphere';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;
type ReturningUserViewProps = {
  controller: ReturnType<typeof useSessionStartController>;
  contractText: string;
  setContractText: (value: string) => void;
  selectedDifficulty: SessionDifficulty;
  setSelectedDifficulty: (value: SessionDifficulty) => void;
  navigation: SessionNavigationProp;
  onStartSession?: () => void;
};

export function ReturningUserView({
  controller,
  contractText,
  setContractText,
  selectedDifficulty,
  setSelectedDifficulty,
  navigation,
  onStartSession,
}: ReturningUserViewProps): React.JSX.Element {
  const handleStudyPlanSelect = (studyPlan: ActiveStudyPlan): void => {
    const target = controller.learningExecutionLayer.target;
    if (target) {
      navigation.setParams(buildLearningSessionParams(target));
    }
    controller.setupState.setSelectedSessionMode(target?.persona === 'creative'
      ? SessionMode.CREATIVE
      : target?.persona === 'student' || target?.persona === 'learning'
        ? SessionMode.STUDY
        : SessionMode.DEEP_WORK);
    controller.setupState.setCustomDuration(studyPlan.remainingMinutes);
    controller.setupState.setShowCustomization(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <GlassScreen showAura={false} variant="focus">
        <SessionSetupAtmosphere />
        <SessionStartStatusCard
          offlineMessage={controller.offlineMessage}
          routeWarningMessage={controller.parsedRoute.warningMessage}
          startErrorMessage={controller.startError}
          onDismissStartError={controller.clearStartError}
        />
        <SessionComposerView
          controller={controller}
          contractText={contractText}
          onBack={() => navigation.goBack()}
          onContractChange={setContractText}
          onDifficultyChange={setSelectedDifficulty}
          onStudyPlanSelect={handleStudyPlanSelect}
          onStart={onStartSession}
          selectedDifficulty={selectedDifficulty}
        />
      </GlassScreen>
    </KeyboardAvoidingView>
  );
}
