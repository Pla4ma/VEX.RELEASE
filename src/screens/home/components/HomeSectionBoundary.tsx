import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

interface HomeSectionBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
}

function SectionErrorFallback({
  sectionName,
  onRetry,
}: {
  sectionName: string;
  onRetry: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onRetry}
      accessibilityLabel={`Retry ${sectionName}`}
      accessibilityRole="button"
    >
      <Box
        p="md"
        borderRadius="lg"
        bg={theme.colors.background.elevated}
        borderWidth={1}
        borderColor={theme.colors.error.light}
        mb="md"
      >
        <Text variant="bodySmall" color="error.DEFAULT">
          {sectionName} did not load.
        </Text>
        <Text variant="caption" color="text.secondary">
          Tap to retry.
        </Text>
      </Box>
    </Pressable>
  );
}

export function HomeSectionBoundary({
  children,
  sectionName,
}: HomeSectionBoundaryProps): JSX.Element {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <SectionErrorFallback
        sectionName={sectionName}
        onRetry={() => setHasError(false)}
      />
    );
  }

  try {
    return <>{children}</>;
  } catch (error: unknown) {
    setHasError(true);
    return (
      <SectionErrorFallback
        sectionName={sectionName}
        onRetry={() => setHasError(false)}
      />
    );
  }
}
