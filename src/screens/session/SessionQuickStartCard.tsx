import React from 'react';

import { Banner } from '../../components/Banner';
import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';

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
      <Box
        p="lg"
        bg="background.secondary"
        borderRadius="xl"
        style={{
          borderWidth: 1,
          borderColor: theme.colors.primary[500],
          gap: theme.spacing[4],
        }}
      >
        <Box gap="xs">
          <Text variant="label" color="primary.500">
            {heroEyebrow}
          </Text>
          <Text variant="h4" color="text.primary">
            {heroTitle}
          </Text>
          <Text variant="body" color="text.secondary">
            {heroBody}
          </Text>
        </Box>

        <Box
          p="md"
          bg="background.primary"
          borderRadius="lg"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            gap: theme.spacing[2],
          }}
        >
          <Text variant="caption" color="text.tertiary">
            Selected session
          </Text>
          <Text variant="label" color="text.primary">
            {presetName}
          </Text>
          <Text variant="caption" color="text.secondary">
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
          accessibilityHint="Starts the selected focus session now">
          {ctaLabel}
        </Button>
        <Button
          variant={hasCustomizations ? 'outline' : 'ghost'}
          onPress={onCustomize}
          accessibilityLabel={hasCustomizations ? 'Hide session customization' : 'Customize session'}
          accessibilityRole="button"
          accessibilityHint="Opens duration, mode, theme, and advanced session options"
        >
          {customizationLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default SessionQuickStartCard;
