import React from 'react';
import { Box, Text, Button } from '@components/primitives';
import { useTheme } from '../../../theme';

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();
  return (
    <Box
      flex={1}
      bg="surface.card"
      borderRadius="lg"
      p="md"
      style={{ minHeight: 80 }}
    >
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="h3" style={{ color, marginTop: theme.spacing[1] }}>
        {value}
      </Text>
    </Box>
  );
}

export function PatternBar({ label, isStrong }: { label: string; isStrong: boolean }) {
  const { theme: _theme } = useTheme();
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      bg="surface.card"
      borderRadius="md"
      p="md"
      mb="sm"
    >
      <Text variant="body" color="text">
        {label}
      </Text>
      <Box
        bg={isStrong ? 'success' : 'warning'}
        borderRadius="full"
        px="sm"
        py="xs"
      >
        <Text variant="caption" color="text.inverse">
          {isStrong ? 'Strongest' : 'Weakest'}
        </Text>
      </Box>
    </Box>
  );
}

export function PremiumLock({ onOpenPaywall }: { onOpenPaywall: () => void }) {
  const { theme } = useTheme();
  return (
    <Box
      bg="surface.card"
      borderRadius="lg"
      p="md"
      mb="md"
      style={{ opacity: 0.7 }}
    >
      <Text
        variant="body"
        color="textMuted"
        style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}
      >
        Premium insight available
      </Text>
      <Button
        onPress={onOpenPaywall}
        variant="outline"
        size="sm"
        accessibilityLabel="Unlock premium insights"
        accessibilityRole="button"
        accessibilityHint="Opens the premium subscription page"
      >
        Unlock with Premium
      </Button>
    </Box>
  );
}
