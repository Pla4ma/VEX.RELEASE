import React, { useEffect } from 'react';
import { Image, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import type { SquadMemberSession } from './SquadSyncIndicator.types';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface MemberIndicatorProps {
  member: SquadMemberSession;
  showCompletionToast: (name: string) => void;
  onEncourage?: (memberId: string, memberName: string) => void;
  hasBeenEncouraged?: boolean;
}

export function SquadMemberIndicator({
  member,
  showCompletionToast,
  onEncourage,
  hasBeenEncouraged,
}: MemberIndicatorProps): JSX.Element {
  const { theme } = useTheme();
  const pulseValue = useSharedValue(1);
  const [showEncourageAction, setShowEncourageAction] = React.useState(false);

  useEffect(() => {
    pulseValue.value = member.isFocusing
      ? withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(1.1, { duration: 1000 }),
          ),
          -1,
          true,
        )
      : withSpring(1);
  }, [member.isFocusing, pulseValue]);

  useEffect(() => {
    if (!member.isFocusing) {
      showCompletionToast(member.displayName);
    }
  }, [member.isFocusing, member.displayName, showCompletionToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const handlePress = (): void => {
    if (member.isFocusing && onEncourage && !hasBeenEncouraged) {
      setShowEncourageAction(true);
    }
  };

  const handleEncourage = (): void => {
    onEncourage?.(member.userId, member.displayName);
    setShowEncourageAction(false);
  };

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        accessibilityLabel={`Squad member ${member.displayName}`}
        accessibilityRole="button"
        accessibilityHint="Shows an encouragement action when this member is focusing"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="sm"
          px="md"
          py="sm"
          borderRadius="xl"
          bg={`${theme.colors.background.elevated}80`}
          borderWidth={1}
          borderColor={
            member.isFocusing
              ? theme.colors.success.DEFAULT
              : theme.colors.border.DEFAULT
          }
        >
          <Box
            width={32}
            height={32}
            borderRadius="full"
            bg={member.avatarUrl ? undefined : theme.colors.background.tertiary}
            borderWidth={2}
            borderColor={
              member.isFocusing
                ? theme.colors.success.DEFAULT
                : theme.colors.border.DEFAULT
            }
            overflow="hidden"
          >
            {member.avatarUrl ? (
              <Image
                source={{ uri: member.avatarUrl }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Text fontSize={14}>👤</Text>
              </Box>
            )}
          </Box>
          <Box>
            <Text variant="bodySmall" color="text.primary" fontWeight="500">
              {member.displayName}
            </Text>
            <Text
              variant="caption"
              color={
                member.isFocusing
                  ? theme.colors.success.DEFAULT
                  : 'text.tertiary'
              }
            >
              {member.isFocusing
                ? `🔥 ${formatDuration(member.elapsedSeconds)}`
                : '✓ Completed'}
            </Text>
          </Box>
          {hasBeenEncouraged && (
            <Box
              px="xs"
              py="xs"
              borderRadius="full"
              bg={`${theme.colors.primary[500]}20`}
            >
              <Text fontSize={12}>💪</Text>
            </Box>
          )}
        </Box>
      </Pressable>

      {showEncourageAction && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          style={{ marginTop: 8 }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            gap="sm"
            px="sm"
            py="xs"
            borderRadius="lg"
            bg={`${theme.colors.primary[500]}15`}
          >
            <Pressable
              onPress={handleEncourage}
              accessibilityLabel={`Encourage ${member.displayName}`}
              accessibilityRole="button"
              accessibilityHint="Sends this squad member encouragement"
            >
              <Box px="md" py="sm" borderRadius="md" bg="primary.500">
                <Text variant="caption" color="text.inverse" fontWeight="600">
                  💪 Encourage {member.displayName}
                </Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={() => setShowEncourageAction(false)}
              accessibilityLabel="Cancel encouragement"
              accessibilityRole="button"
              accessibilityHint="Closes the encouragement action"
            >
              <Box px="sm" py="sm">
                <Text variant="caption" color="text.tertiary">
                  Cancel
                </Text>
              </Box>
            </Pressable>
          </Box>
        </Animated.View>
      )}
    </Animated.View>
  );
}
