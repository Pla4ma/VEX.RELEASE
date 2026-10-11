import React from 'react';
import { Image, Pressable, ScrollView } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { FOCUS_MODE_CARDS } from '../../../features/session-start/components/ModeSelector.data';
import type { useSessionStartController } from '../../../features/session-start/hooks';
import type { SessionDifficulty } from '../../../features/session-start/components/DifficultySelector';
import { SessionContractInput } from './SessionContractInput';
import { SessionSetupDifficultyCard } from './SessionSetupDifficultyCard';
import { SessionSetupCustomizationSection } from './SessionSetupCustomizationSection';
import { SessionSetupStudyPlanCard } from './SessionSetupStudyPlanCard';
import { SessionModeTile, SessionPresetChip } from './SessionComposerOptions';

type Controller = ReturnType<typeof useSessionStartController>;

type SessionComposerViewProps = {
  controller: Controller;
  contractText: string;
  onContractChange: (value: string) => void;
  selectedDifficulty: SessionDifficulty;
  onDifficultyChange: (value: SessionDifficulty) => void;
  onBack: () => void;
  onStart?: () => void;
  onStudyPlanSelect: (plan: NonNullable<Controller['activeStudyPlan']['data']>) => void;
};

export function SessionComposerView({
  controller,
  contractText,
  onContractChange,
  selectedDifficulty,
  onDifficultyChange,
  onBack,
  onStart,
  onStudyPlanSelect,
}: SessionComposerViewProps): React.JSX.Element {
  const { theme } = useTheme();
  const filteredPresets = controller.filteredPresets;
  const activeGoal = controller.parsedRoute.params?.goal ?? 'A clear block of attention';
  const modeCards = FOCUS_MODE_CARDS;

  return (
    <ScrollView
      contentContainerStyle={{ gap: theme.spacing[5], padding: theme.spacing[5], paddingBottom: theme.spacing[24] }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Pressable
          accessibilityHint="Returns without starting a session"
          accessibilityLabel="Close session composer"
          accessibilityRole="button"
          onPress={onBack}
          style={{ alignItems: 'center', justifyContent: 'center', minHeight: theme.spacing[12], minWidth: theme.spacing[12] }}
        >
          <VexIcon color={vexFire.cream} name="x" size="sm" variant="solid" />
        </Pressable>
        <Box alignItems="center">
          <Text color={vexFire.ember} variant="label">FOCUS STUDIO</Text>
          <Text color={vexFire.cream} variant="h4">Shape the block</Text>
        </Box>
        <Box minWidth={theme.spacing[12]} />
      </Box>

      <VexSurface tone="hero" style={{ padding: theme.spacing[5] }}>
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box flex={1} gap="xs">
            <Text color={vexFire.textMuted} variant="label">{controller.sessionHero.eyebrow}</Text>
            <Text color={vexFire.cream} variant="h3">{controller.sessionHero.title}</Text>
            <Text color={vexFire.textSecondary} variant="body">{controller.sessionHero.body}</Text>
          </Box>
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="First focus block artwork"
            resizeMode="contain"
            source={require('../../../../assets/vex/guides/guide-first-block.png')}
            style={{ height: theme.spacing[24], width: theme.spacing[24] }}
          />
        </Box>
        <Box mt="lg" p="md" style={{ backgroundColor: vexFire.backgroundSoft, borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1 }}>
          <Text color={vexFire.textMuted} variant="caption">INTENTION</Text>
          <Text color={vexFire.cream} numberOfLines={2} variant="body">{activeGoal}</Text>
        </Box>
      </VexSurface>

      <Box gap="sm">
        <Text color={vexFire.textSecondary} variant="label">Choose your lane</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: theme.spacing[3] }} showsHorizontalScrollIndicator={false}>
          {modeCards.map((card) => (
            <SessionModeTile card={card} key={card.mode} onPress={() => controller.setupState.setSelectedSessionMode(card.mode)} selected={controller.setupState.selectedSessionMode === card.mode} />
          ))}
        </ScrollView>
      </Box>

      <Box gap="sm">
        <Text color={vexFire.textSecondary} variant="label">Set the length</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: theme.spacing[2] }} showsHorizontalScrollIndicator={false}>
          {filteredPresets.map((preset) => (
            <SessionPresetChip duration={preset.duration} key={preset.id} name={preset.name} onPress={() => controller.setupState.setSelectedPreset(preset)} selected={controller.setupState.selectedPreset.id === preset.id} />
          ))}
        </ScrollView>
      </Box>

      {controller.activeStudyPlan.data ? (
        <SessionSetupStudyPlanCard copy={controller.learningExecutionLayer.copy} onSelect={onStudyPlanSelect} studyPlan={controller.activeStudyPlan.data} />
      ) : null}

      <SessionContractInput disabled={controller.isStarting} onChangeText={onContractChange} value={contractText} />

      <Pressable
        accessibilityHint="Opens optional intensity, themes, and advanced session settings"
        accessibilityLabel={controller.setupState.showCustomization ? 'Hide advanced session settings' : 'Tune session settings'}
        accessibilityRole="button"
        onPress={() => controller.setupState.setShowCustomization((current) => !current)}
        style={{ minHeight: theme.spacing[12] }}
      >
        <Box alignItems="center" flexDirection="row" justifyContent="center" gap="sm">
          <VexIcon color={vexFire.amber} name="sliders" size="sm" variant="outline" />
          <Text color={vexFire.amber} variant="button">{controller.setupState.showCustomization ? 'Hide tuning' : 'Tune session'}</Text>
        </Box>
      </Pressable>

      {controller.setupState.showCustomization ? (
        <>
          <SessionSetupDifficultyCard disabled={controller.isStarting} onChange={onDifficultyChange} selected={selectedDifficulty} selectedDurationSeconds={controller.selectedDurationSeconds} />
          <SessionSetupCustomizationSection controller={controller} routeParams={controller.parsedRoute.params} />
        </>
      ) : null}

      <Button
        accessibilityHint="Starts the selected session"
        accessibilityLabel={`Start ${Math.round(controller.selectedDurationSeconds / 60)} minute session`}
        accessibilityRole="button"
        fullWidth
        isLoading={controller.isStarting}
        onPress={onStart ?? controller.handleStartSession}
        size="lg"
        style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.lg }}
        variant="primary"
      >
        <Text color={vexFire.background} variant="button">{controller.sessionSummary.ctaLabel}</Text>
      </Button>
    </ScrollView>
  );
}
