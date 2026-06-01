import React from 'react';
import { ScrollView } from 'react-native';
import {
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../../components/primitives/Box';
import { SessionStartStatusCard } from '../../../features/session-start/components/SessionStartStatusCard';
import type { SessionDifficulty } from '../../../features/session-start/components/DifficultySelector';
import { useSessionStartController } from '../../../features/session-start/hooks';
import { SessionMode } from '../../../session/modes';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
import type { ActiveStudyPlan } from '../../../features/content-study/hooks';
import { SessionQuickStartCard } from '../SessionQuickStartCard';
import { SessionContractInput } from './SessionContractInput';
import { SessionSetupCustomizationSection } from './SessionSetupCustomizationSection';
import { SessionSetupDifficultyCard } from './SessionSetupDifficultyCard';
import { SessionSetupFooter } from './SessionSetupFooter';
import { SessionSetupHeader } from './SessionSetupHeader';
import { SessionSetupStakesCard } from './SessionSetupStakesCard';
import { SessionSetupStudyPlanCard } from './SessionSetupStudyPlanCard';
import { useSessionSetupStakes } from '../hooks/useSessionSetupStakes';
import { buildLearningSessionParams } from '../../../features/learning-execution';
import { isFeatureHidden } from '../../../features/liveops-config/final-release-feature-map';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;
type SessionSetupRouteProp = RouteProp<SessionStackParams, 'SessionSetup'>;

type ReturningUserViewProps = {
  controller: ReturnType<typeof useSessionStartController>;
  contractText: string;
  setContractText: (value: string) => void;
  selectedDifficulty: SessionDifficulty;
  setSelectedDifficulty: (value: SessionDifficulty) => void;
  navigation: SessionNavigationProp;
  route: SessionSetupRouteProp;
};

export function ReturningUserView({
  controller,
  contractText,
  setContractText,
  selectedDifficulty,
  setSelectedDifficulty,
  navigation,
  route,
}: ReturningUserViewProps): JSX.Element {
  const stakes = useSessionSetupStakes({
    currentStreakDays: controller.streak?.currentDays ?? null,
    selectedDurationSeconds: controller.selectedDurationSeconds,
    userId: controller.userId || '',
  });
  const showStakes =
    !isFeatureHidden('boss_tab') || !isFeatureHidden('challenges');

  const handleStudyPlanSelect = (studyPlan: ActiveStudyPlan) => {
    const target = controller.learningExecutionLayer.target;
    if (target) {
      navigation.setParams(buildLearningSessionParams(target));
    }
    controller.setupState.setSelectedSessionMode(
      target?.persona === 'creative'
        ? SessionMode.CREATIVE
        : target?.persona === 'student' || target?.persona === 'learning'
          ? SessionMode.STUDY
          : SessionMode.DEEP_WORK,
    );
    controller.setupState.setCustomDuration(studyPlan.remainingMinutes);
    controller.setupState.setShowCustomization(true);
  };

  return (
    <Box flex={1} bg="background.primary">
      <SessionSetupHeader
        durationSeconds={controller.selectedDurationSeconds}
        mode={controller.setupState.selectedSessionMode}
        onBack={() => navigation.goBack()}
        userId={controller.userId}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <SessionStartStatusCard
          offlineMessage={controller.offlineMessage}
          routeWarningMessage={controller.parsedRoute.warningMessage}
          startErrorMessage={controller.startError}
          onDismissStartError={controller.clearStartError}
        />

        <SessionSetupStudyPlanCard
          copy={controller.learningExecutionLayer.copy}
          studyPlan={controller.activeStudyPlan.data ?? null}
          onSelect={handleStudyPlanSelect}
        />

        <SessionQuickStartCard
          ctaLabel={controller.sessionSummary.ctaLabel}
          customizationLabel={controller.sessionSummary.customizationLabel}
          currentThemeName={controller.selectedTheme.name}
          durationMinutes={Math.round(controller.selectedDurationSeconds / 60)}
          heroBody={controller.sessionHero.body}
          heroEyebrow={controller.sessionHero.eyebrow}
          heroTitle={controller.sessionHero.title}
          hasCustomizations={controller.setupState.showCustomization}
          isStarting={controller.isStarting}
          onCustomize={() =>
            controller.setupState.setShowCustomization((current) => !current)
          }
          onStart={() => void controller.handleStartSession()}
          presetName={controller.setupState.selectedPreset.name}
          smartSuggestion={controller.setupState.smartSuggestion}
          subtitle={controller.sessionSummary.subtitle}
          contractInput={
            <SessionContractInput
              disabled={controller.isStarting}
              onChangeText={setContractText}
              value={contractText}
            />
          }
        />

        {showStakes ? <SessionSetupStakesCard stakes={stakes} /> : null}

        <SessionSetupDifficultyCard
          disabled={controller.isStarting}
          selected={selectedDifficulty}
          selectedDurationSeconds={controller.selectedDurationSeconds}
          onChange={setSelectedDifficulty}
        />

        <SessionSetupCustomizationSection
          controller={controller}
          routeParams={route.params}
        />

        <Box height={120} />
      </ScrollView>

      {controller.setupState.showCustomization ? (
        <SessionSetupFooter
          breakDurationSeconds={
            controller.setupState.selectedPreset.breakDuration
          }
          durationMinutes={Math.round(controller.selectedDurationSeconds / 60)}
          intervalCount={controller.setupState.selectedPreset.intervals}
          isStarting={controller.isStarting}
          onStart={() => void controller.handleStartSession()}
          selectedSessionMode={controller.setupState.selectedSessionMode}
          selectedThemeLabel={
            controller.selectedThemeOwned ? controller.selectedTheme.name : null
          }
        />
      ) : null}
    </Box>
  );
}
