import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePersonalBestPreview } from '../../../features/personal-bests/hooks';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import type { SessionMode } from '../../../session/modes';
import { useTheme } from '../../../theme/ThemeContext';

type SessionSetupHeaderProps = {
  durationSeconds: number;
  mode: SessionMode;
  onBack: () => void;
  userId: string | null;
};

export function SessionSetupHeader({
  durationSeconds,
  mode,
  onBack,
  userId,
}: SessionSetupHeaderProps) {
  const { theme } = useTheme();
  const preview = usePersonalBestPreview(userId, mode, durationSeconds);
  const previewCopy = preview.data
    ? `Your best: ${Math.round(preview.data.bestPurityScore)} purity · ${preview.data.bestGrade}`
    : 'First time at this length. Focus clean.';

  return (
    <>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        p="lg"
        pb="xl"
      >
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen without starting a session"
          hitSlop={theme.spacing[2]}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            minWidth: 44,
          }}
        >
          <Icon name="arrow-left" size="lg" color={theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4">New Session</Text>
        <Box width={40} />
      </Box>

      <Animated.View entering={FadeInUp.delay(100)}>
        <Box p="lg" pt="sm">
          <Text variant="h2" color="primary.500" mb="sm">
            Start fast, customize only if needed
          </Text>
          <Text variant="body" color="text.secondary">
            The default path is one tap. Open customization only when you want
            to tune the session.
          </Text>
          {preview.isPending ? (
            <Box mt="md">
              <Skeleton
                width="56%"
                height={14}
                borderRadius={theme.borderRadius.sm}
              />
            </Box>
          ) : preview.isError ? null : (
            <Text variant="caption" color="text.tertiary" mt="md">
              {previewCopy}
            </Text>
          )}
        </Box>
      </Animated.View>
    </>
  );
}
