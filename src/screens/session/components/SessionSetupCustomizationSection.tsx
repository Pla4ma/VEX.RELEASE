import React from 'react';
import type { SessionStackParams } from '../../../navigation/types';
import { useSessionStartController } from '../../../features/session-start/hooks';
import { SessionSetupCustomization } from './SessionSetupCustomization';

type Controller = ReturnType<typeof useSessionStartController>;
type SessionSetupCustomizationSectionProps = {
  controller: Controller;
  routeParams: SessionStackParams['SessionSetup'] | undefined;
};

export function SessionSetupCustomizationSection({
  controller,
  routeParams,
}: SessionSetupCustomizationSectionProps): React.JSX.Element | null {
  if (!controller.setupState.showCustomization) {
    return null;
  }

  return (
    <SessionSetupCustomization
      activeChallenges={controller.activeChallenges}
      filteredPresets={controller.filteredPresets}
      hasActiveStudyPlan={routeParams?.source === 'content-study'}
      onPressTheme={controller.handleThemePress}
      onSelectPreset={controller.setupState.setSelectedPreset}
      onSelectSessionMode={controller.setupState.setSelectedSessionMode}
      onSelectSmartSuggestion={() => {
        if (!controller.setupState.smartSuggestion) {
          return;
        }
        controller.setupState.setSelectedPreset(
          controller.setupState.smartSuggestion.preset,
        );
        controller.setupState.setSelectedCategory(
          controller.setupState.smartSuggestion.preset.category ?? 'standard',
        );
      }}
      onToggleAdvanced={() =>
        controller.setupState.setShowAdvanced((current) => !current)
      }
      onUpdateCategory={controller.setupState.setSelectedCategory}
      routeSuggestedDifficulty={routeParams?.suggestedDifficulty}
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
      themeQueryRetry={controller.selectableThemesQuery.refetch}
      themes={controller.userThemes}
    />
  );
}
