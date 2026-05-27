import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Banner } from "../../../components/Banner";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Icon } from "../../../icons";
import type { SessionTheme } from "../../../features/themes/session-themes";
import { TabBar } from "../../../shared/ui/components/TabBar";
import { InteractiveCard } from "../../../shared/ui/components/InteractiveCard";
import { ModeSelector } from "../../../features/session-start/components/ModeSelector";
import type { SessionMode } from "../../../session/modes";
import { useTheme } from "../../../theme";
import {
  PRESET_CATEGORIES,
  type PresetWithIcon,
  type SmartSuggestion,
} from "../utils/session-setup";
import { SessionAdvancedOptions } from "./SessionAdvancedOptions";
import { SessionThemeSelector } from "./SessionThemeSelector";

type Challenge = NonNullable<
  import("../../../features/mastery/types").MasteryState["activeChallenges"]
>[number];

type SessionSetupCustomizationProps = {
  activeChallenges: Challenge[];
  filteredPresets: PresetWithIcon[];
  hasActiveStudyPlan: boolean;
  onPressTheme: (theme: SessionTheme) => void;
  onSelectPreset: (preset: PresetWithIcon) => void;
  onSelectSessionMode: (mode: SessionMode) => void;
  onSelectSmartSuggestion: () => void;
  onToggleAdvanced: () => void;
  onUpdateCategory: (category: string) => void;
  routeSuggestedDifficulty?: "EASY" | "NORMAL" | "CHALLENGING" | "PUSH";
  selectedCategory: string;
  selectedDurationSeconds: number;
  selectedPreset: PresetWithIcon;
  selectedSessionMode: SessionMode;
  selectedTheme: SessionTheme;
  selectedThemeId: string;
  showAdvanced: boolean;
  smartSuggestion: SmartSuggestion | null;
  themeQueryError: boolean;
  themeQueryLoading: boolean;
  themeQueryRetry: () => void;
  themes: SessionTheme[];
};

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

      {activeChallenges.length > 0 ? (
        <Box px="lg" mt="lg">
          <Text variant="label" mb="sm">
            Active Challenges
          </Text>
          <Box gap="sm">
            {activeChallenges.map((challenge) => (
              <Box
                key={challenge.id}
                p="md"
                bg="background.secondary"
                borderRadius="lg"
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border.light,
                }}
              >
                <Text variant="body" color="text.primary">
                  {challenge.title}
                </Text>
                <Text variant="caption" color="text.secondary" mt="xs">
                  Complete this session to progress
                </Text>
                <Text variant="label" color="primary.500" mt="sm">
                  {`+${challenge.masteryPoints} XP`}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

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
