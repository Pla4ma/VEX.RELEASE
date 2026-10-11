import React from 'react';
import { Image } from 'react-native';

import { Banner } from '../../components/Banner';
import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { VexSurface } from '../../shared/ui/vex/VexSurface';
import { spacing } from '../../theme/tokens/spacing';
import { vexFire } from '../../theme/tokens/vex-fire';

type SmartSuggestion = {
  description: string;
  confidence: number;
};

type SessionQuickStartCardProps = {
  contractInput?: React.ReactNode;
  ctaLabel: string;
  customizationLabel: string;
  currentThemeName: string;
  durationMinutes: number;
  heroBody: string;
  heroEyebrow: string;
  heroTitle: string;
  hasCustomizations: boolean;
  isStarting: boolean;
  onCustomize: () => void;
  onStart: () => void;
  presetName: string;
  smartSuggestion: SmartSuggestion | null;
  subtitle: string;
};

export function SessionQuickStartCard({
  contractInput,
  ctaLabel,
  customizationLabel,
  currentThemeName,
  durationMinutes,
  heroBody,
  heroEyebrow,
  heroTitle,
  hasCustomizations,
  isStarting,
  onCustomize,
  onStart,
  presetName,
  smartSuggestion,
  subtitle,
}: SessionQuickStartCardProps) {
  const { theme } = useTheme();

  return (
    <Box px="lg" mb="lg">
      <VexSurface tone="hero" style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, gap: theme.spacing[4] }}>
        <Box flexDirection="row" gap="md" alignItems="center">
          <Box flex={1} gap="xs">
            <Text variant="label" color={vexFire.ember}>
              {heroEyebrow}
            </Text>
            <Text variant="h4" color={vexFire.cream}>
              {heroTitle}
            </Text>
            <Text variant="body" color={vexFire.textSecondary}>
              {heroBody}
            </Text>
        </Box>
        <Image
          source={require('../../../assets/vex/session/focus-core.png')}
            resizeMode="contain"
            style={{ height: spacing[24] + spacing[2], width: spacing[24] + spacing[2] }}
            accessibilityLabel="Ember focus core"
          />
        </Box>

        <Box
          p="md"
          bg="semantic.surfaceGlass"
          borderRadius={theme.borderRadius.xl}
          style={{
            backgroundColor: vexFire.backgroundRaised,
            borderWidth: 1,
            borderColor: vexFire.border,
            gap: theme.spacing[2],
          }}
        >
            <Text variant="caption" color={vexFire.textMuted}>
            Selected session
          </Text>
          <Text variant="label" color={vexFire.cream}>
            {presetName}
          </Text>
          <Text variant="caption" color={vexFire.textSecondary}>
            {subtitle}
          </Text>
        </Box>

        {smartSuggestion && smartSuggestion.confidence >= 0.75 ? (
          <Banner
            variant="info"
            title="Recommended for today"
            description={smartSuggestion.description}
          />
        ) : null}

        {contractInput}

          <Button
          variant="primary"
          size="lg"
          onPress={onStart}
          isLoading={isStarting}
          fullWidth
          accessibilityLabel={`Start ${durationMinutes} minute session with ${currentThemeName}`}
          accessibilityRole="button"
          accessibilityHint="Starts the selected focus session now"
          style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.lg }}
        >
          <Text color={vexFire.background}>{ctaLabel}</Text>
        </Button>
        <Button
          variant={hasCustomizations ? 'outline' : 'ghost'}
          onPress={onCustomize}
          accessibilityLabel={
            hasCustomizations
              ? 'Hide session customization'
              : 'Customize session'
          }
          accessibilityRole="button"
          accessibilityHint="Opens duration, mode, theme, and advanced session options"
          style={{ borderColor: vexFire.border, borderRadius: theme.borderRadius.lg }}
        >
          <Text color={vexFire.textSecondary}>{customizationLabel}</Text>
        </Button>
      </VexSurface>
    </Box>
  );
}
