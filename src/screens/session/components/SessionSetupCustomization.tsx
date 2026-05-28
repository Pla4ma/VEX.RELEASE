import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Banner } from "../../../components/Banner";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Icon } from "../../../icons";
import { TabBar } from "../../../shared/ui/components/TabBar";
import { InteractiveCard } from "../../../shared/ui/components/InteractiveCard";
import { ModeSelector } from "../../../features/session-start/components/ModeSelector";
import { useTheme } from "../../../theme";
import { PRESET_CATEGORIES } from "../utils/session-setup";
import { SessionAdvancedOptions } from "./SessionAdvancedOptions";
import { SessionThemeSelector } from "./SessionThemeSelector";
import { ActiveChallenges } from "./ActiveChallenges";
import type { SessionSetupCustomizationProps } from "./session-setup-customization-types";

export function SessionSetupCustomization({
  activeChallenges,
  filteredPresets,
  hasActiveStudyPlan,
  onPressTheme,
  onSelectPreset,
  onSelectSessionMode,
  onSelectSmartSuggestion,
  onToggleAdvanced,
  onUpdateCategory,
  routeSuggestedDifficulty,
  selectedCategory,
  selectedDurationSeconds,
  selectedPreset,
  selectedSessionMode,
  selectedTheme,
  selectedThemeId,
  showAdvanced,
  smartSuggestion,
  themeQueryError,
  themeQueryLoading,
  themeQueryRetry,
  themes,
}: SessionSetupCustomizationProps) {
  const { theme } = useTheme();
  const tabs = PRESET_CATEGORIES.map((category) => ({
    id: category.key,
    label: category.label,
    icon: category.icon,
  }));

  return (
    <>
      <Box px="lg" mb="md">
        <TabBar
          tabs={tabs}
          activeTab={selectedCategory}
          onChange={onUpdateCategory}
          variant="pills"
          size="sm"
        />
      </Box>

      {routeSuggestedDifficulty ? (
        <Box px="lg" mb="md">
          <Box
            p="md"
            bg="background.secondary"
            borderRadius="lg"
            style={{ borderWidth: 1, borderColor: theme.colors.primary[500] }}
          >
            <Text variant="label" color="primary.500" mb="xs">
              Suggested by your coach
            </Text>
            <Text variant="body" color="text.secondary">
              {`Difficulty target: ${routeSuggestedDifficulty}`}
            </Text>
          </Box>
        </Box>
      ) : null}

      {smartSuggestion && smartSuggestion.confidence >= 0.75 ? (
        <Box px="lg" mb="md">
          <Banner
            variant="info"
            title="Smart Pick"
            description={smartSuggestion.description}
            actionText="Use this"
            onAction={onSelectSmartSuggestion}
          />
        </Box>
      ) : null}

      <Box px="lg" mb="md">
        <ModeSelector
          hasActiveStudyPlan={hasActiveStudyPlan}
          selectedMode={selectedSessionMode}
          onModeChange={onSelectSessionMode}
        />
      </Box>

      <Box px="lg">
        {filteredPresets.map((preset, index) => (
          <Animated.View
            key={preset.id}
            entering={FadeInUp.delay(100 + index * 40)}
            style={{ marginBottom: 8 }}
          >
            <InteractiveCard
              variant={
                selectedPreset.id === preset.id ? "elevated" : "outlined"
              }
              state={selectedPreset.id === preset.id ? "selected" : "default"}
              onPress={() => onSelectPreset(preset)}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                gap="md"
                px="md"
                py="sm"
              >
                <Icon
                  name={preset.icon}
                  size="md"
                  color={theme.colors.primary[500]}
                />
                <Box flex={1}>
                  <Text variant="label">{preset.name}</Text>
                  <Text variant="caption" color="text.secondary">
                    {`${Math.round(preset.duration / 60)} min - ${preset.intervals} interval${preset.intervals !== 1 ? "s" : ""}`}
                  </Text>
                </Box>
                {selectedPreset.id === preset.id ? (
                  <Icon
                    name="check"
                    size="sm"
                    color={theme.colors.primary[500]}
                  />
                ) : null}
              </Box>
            </InteractiveCard>
          </Animated.View>
        ))}
      </Box>

      <ActiveChallenges challenges={activeChallenges} />

      <SessionThemeSelector
        onPressTheme={onPressTheme}
        selectedDurationSeconds={selectedDurationSeconds}
        selectedTheme={selectedTheme}
        selectedThemeId={selectedThemeId}
        themeQueryError={themeQueryError}
        themeQueryLoading={themeQueryLoading}
        themeQueryRetry={themeQueryRetry}
        themes={themes}
      />

      <SessionAdvancedOptions
        onToggle={onToggleAdvanced}
        selectedDurationSeconds={selectedDurationSeconds}
        selectedPreset={selectedPreset}
        showAdvanced={showAdvanced}
      />
    </>
  );
}
