import React from 'react';
import { ScrollView } from 'react-native';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { SessionStartStatusCard } from '../../features/session-start/components/SessionStartStatusCard';
import { SessionStakesBriefing } from '../../features/session-start/components/SessionStakesBriefing';
import { DifficultySelector, type SessionDifficulty } from '../../features/session-start/components/DifficultySelector';
import { useSessionStartController } from '../../features/session-start/hooks';
import { StudyPlanSuggestionCard } from '../../features/content-study/components/StudyPlanSuggestionCard';
import { SessionMode } from '../../session/modes';
import { ThemeShopModal } from '../../features/themes/ThemeShopModal';
import type { ExtendedRootStackParams, SessionStackParams } from '../../navigation/types';
import type { ActiveStudyPlan } from '../../features/content-study/hooks';
import { SessionQuickStartCard } from './SessionQuickStartCard';
import { SessionSetupCustomization } from './components/SessionSetupCustomization';
import { SessionSetupFooter } from './components/SessionSetupFooter';
import { SessionSetupHeader } from './components/SessionSetupHeader';
import { useSessionSetupStakes } from './hooks/useSessionSetupStakes';
import { StreakInsurancePrompt } from '../../features/streaks/components/StreakInsurancePrompt';
import { useInsuranceStatus, useBalance } from '../../features/economy/hooks';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;
type SessionSetupRouteProp = RouteProp<SessionStackParams, 'SessionSetup'>;

export const SessionSetupScreen = withScreenErrorBoundary(function _SessionSetupScreen(): React.JSX.Element {
  const navigation = useNavigation<SessionNavigationProp>();
  const route = useRoute<SessionSetupRouteProp>();
  const controller = useSessionStartController({
    navigation,
    routeParams: route.params,
  });

  // Difficulty selection state (default to FOCUSED)
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<SessionDifficulty>('FOCUSED');

  // Streak insurance prompt state
  const [insurancePromptDismissed, setInsurancePromptDismissed] = React.useState(false);

  // Insurance and balance data
  const { status: insuranceStatus } = useInsuranceStatus(controller.userId ?? undefined);
  const { data: coinBalance } = useBalance(controller.userId ?? '', 'COINS');

  // Check if streak insurance prompt should show
  const shouldShowInsurancePrompt = React.useMemo(() => {
    const streakDays = controller.streak?.currentDays ?? 0;
    const hasInsurance = insuranceStatus?.hasActiveInsurance ?? false;
    return streakDays >= 3 && !hasInsurance && !insurancePromptDismissed;
  }, [controller.streak?.currentDays, insuranceStatus?.hasActiveInsurance, insurancePromptDismissed]);

  const stakes = useSessionSetupStakes({
    currentStreakDays: controller.streak?.currentDays ?? null,
    selectedDurationSeconds: controller.selectedDurationSeconds,
    userId: controller.userId || '',
  });

  const handleStudyPlanSelect = (studyPlan: ActiveStudyPlan) => {
    // Auto-select STUDY mode
    controller.setupState.setSelectedSessionMode(SessionMode.STUDY);
    // Set custom duration from study plan
    controller.setupState.setCustomDuration(studyPlan.remainingMinutes);
    // Expand customization to show the selection
    controller.setupState.setShowCustomization(true);
  };

  if (!controller.userId) {
    return (
      <Box flex={1} bg="background.primary" justifyContent="center" alignItems="center" p="lg">
        <Text variant="h4" color="error.DEFAULT" mb="md">
          Not authenticated
        </Text>
        <Button
          variant="primary"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen"
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="background.primary">
      <SessionSetupHeader onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <SessionStartStatusCard
          offlineMessage={controller.offlineMessage}
          routeWarningMessage={controller.parsedRoute.warningMessage}
          startErrorMessage={controller.startError}
          onDismissStartError={controller.clearStartError}
        />

        {/* Study Plan Suggestion - shown when user has active study plan */}
        {controller.activeStudyPlan.data && (
          <Box px="lg" mt="md">
            <StudyPlanSuggestionCard
              studyPlan={controller.activeStudyPlan.data}
              onSelect={handleStudyPlanSelect}
            />
          </Box>
        )}

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
          onCustomize={() => controller.setupState.setShowCustomization((current) => !current)}
          onStart={() => void controller.handleStartSession()}
          presetName={controller.setupState.selectedPreset.name}
          smartSuggestion={controller.setupState.smartSuggestion}
          subtitle={controller.sessionSummary.subtitle}
        />

        {/* PHASE 7.1: Session Stakes Briefing - Shows what's at stake before starting */}
        <Box px="lg" mt="md">
          <SessionStakesBriefing
            bossStake={stakes.bossStake}
            streakStake={stakes.streakStake}
            challengeStake={stakes.challengeStake}
            rivalStake={stakes.rivalStake}
            onStakePress={(stakeId) => {
              if (stakeId === 'boss') {navigation.navigate('Boss');}
              if (stakeId === 'streak') {navigation.navigate('Main', { screen: 'Progress' });}
              if (stakeId === 'challenge') {navigation.navigate('Challenges');}
              if (stakeId === 'rival') {navigation.navigate('Rivals');}
            }}
          />
        </Box>

        {/* PHASE 6.1: Streak Insurance Prompt - Show for streak >= 3 days without insurance */}
        {shouldShowInsurancePrompt && (
          <StreakInsurancePrompt
            streakDays={controller.streak?.currentDays ?? 0}
            insuranceCost={200}
            userCoins={coinBalance ?? 0}
            onPurchase={() => {
              // Navigate to shop or open insurance modal
              controller.setShopTheme(null);
              // Open insurance purchase modal
              navigation.navigate('Shop');
            }}
            onDismiss={() => setInsurancePromptDismissed(true)}
          />
        )}

        {/* PHASE 4: Difficulty Selector with XP Preview */}
        <Box px="lg" mt="md" mb="md">
          <Box mb="sm">
            <Text variant="label" color="text.secondary">
              Select Difficulty
            </Text>
            <Text variant="caption" color="text.tertiary">
              Estimated XP: {Math.round(
                (controller.selectedDurationSeconds / 60) * (selectedDifficulty === 'CASUAL' ? 0.5 : selectedDifficulty === 'DEEP_WORK' ? 1.5 : 1.0)
              )} {selectedDifficulty === 'DEEP_WORK' ? '(1.5× Deep Work bonus)' : selectedDifficulty === 'CASUAL' ? '(0.5× Casual)' : ''}
            </Text>
          </Box>
          <DifficultySelector
            selected={selectedDifficulty}
            onChange={setSelectedDifficulty}
            disabled={controller.isStarting}
          />
        </Box>

        {controller.setupState.showCustomization ? (
          <SessionSetupCustomization
            activeChallenges={controller.activeChallenges}
            filteredPresets={controller.filteredPresets}
            hasActiveStudyPlan={route.params?.source === 'content-study'}
            onPressTheme={controller.handleThemePress}
            onSelectPreset={controller.setupState.setSelectedPreset}
            onSelectSessionMode={controller.setupState.setSelectedSessionMode}
            onSelectSmartSuggestion={() => {
              if (!controller.setupState.smartSuggestion) {
                return;
              }

              controller.setupState.setSelectedPreset(controller.setupState.smartSuggestion.preset);
              controller.setupState.setSelectedCategory(
                controller.setupState.smartSuggestion.preset.category ?? 'standard',
              );
            }}
            onToggleAdvanced={() => controller.setupState.setShowAdvanced((current) => !current)}
            onUpdateCategory={controller.setupState.setSelectedCategory}
            routeSuggestedDifficulty={route.params?.suggestedDifficulty}
            selectedCategory={controller.setupState.selectedCategory}
            selectedDurationSeconds={controller.selectedDurationSeconds}
            selectedPreset={controller.setupState.selectedPreset}
            selectedSessionMode={controller.setupState.selectedSessionMode}
            selectedTheme={controller.selectedTheme}
            selectedThemeId={controller.setupState.selectedThemeId}
            showAdvanced={controller.setupState.showAdvanced}
            smartSuggestion={controller.setupState.smartSuggestion}
            themeQueryError={controller.selectableThemesQuery.isError}
            themeQueryLoading={controller.selectableThemesQuery.isLoading}
            themeQueryRetry={() => void controller.selectableThemesQuery.refetch()}
            themes={controller.userThemes}
          />
        ) : null}

        <Box height={120} />
      </ScrollView>

      {controller.setupState.showCustomization ? (
        <SessionSetupFooter
          breakDurationSeconds={controller.setupState.selectedPreset.breakDuration}
          durationMinutes={Math.round(controller.selectedDurationSeconds / 60)}
          intervalCount={controller.setupState.selectedPreset.intervals}
          isStarting={controller.isStarting}
          onStart={() => void controller.handleStartSession()}
          selectedSessionMode={controller.setupState.selectedSessionMode}
          selectedThemeLabel={controller.selectedThemeOwned ? controller.selectedTheme.name : null}
        />
      ) : null}

      <ThemeShopModal
        userId={controller.userId}
        isVisible={controller.shopTheme !== null}
        theme={controller.shopTheme}
        streak={controller.streak ?? null}
        onClose={() => controller.setShopTheme(null)}
        onPurchased={controller.setupState.setSelectedThemeId}
        onGetCoins={() => controller.setShopTheme(null)}
      />
    </Box>
  );
}, 'Session Setup');

export default SessionSetupScreen;
