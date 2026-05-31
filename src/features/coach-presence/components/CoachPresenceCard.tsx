import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { buttonTap } from '../../../utils/haptics';
import type { CoachPresence } from '../schemas';

interface CoachPresenceCardProps {
  presence: CoachPresence;
  onAction: () => void;
  onPress?: () => void;
}

export function CoachPresenceCard({
  presence,
  onAction,
  onPress,
}: CoachPresenceCardProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => {
        buttonTap();
        (onPress ?? onAction)();
      }}
      accessibilityLabel="Coach presence"
      accessibilityRole="button"
      accessibilityHint="Opens the coach presence action"
    >
      <View
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border.light,
          borderRadius: theme.spacing[3],
          borderWidth: 1,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        }}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: theme.spacing[3],
          }}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: theme.spacing[6],
              height: 48,
              justifyContent: 'center',
              width: 48,
            }}
          >
            <Text variant="h3" color="text.primary">
              {getPresenceMark(presence.visualCompanionState.reaction)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text variant="label" color="text.secondary">
              Coach Presence
            </Text>
            <Text
              variant="body"
              color="text.primary"
              style={{ fontWeight: '700' }}
            >
              {presence.message}
            </Text>
          </View>
        </View>

        <Text variant="caption" color="text.secondary">
          {presence.progressReaction}
        </Text>

        <Pressable
          onPress={() => {
            buttonTap();
            onAction();
          }}
          accessibilityLabel={presence.nextAction.label}
          accessibilityRole="button"
          accessibilityHint={presence.nextAction.reason}
        >
          <View
            style={{
              ...getMinTouchTargetStyle(),
              alignItems: 'center',
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.spacing[2],
              justifyContent: 'center',
              paddingHorizontal: theme.spacing[4],
            }}
          >
            <Text variant="label" color={theme.colors.text.inverse}>
              {presence.nextAction.label}
            </Text>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getPresenceMark(
  reaction: CoachPresence['visualCompanionState']['reaction'],
): string {
  if (reaction === 'celebrating') {
    return '*';
  }
  if (reaction === 'focused') {
    return '>';
  }
  if (reaction === 'recovering') {
    return '~';
  }
  if (reaction === 'ready') {
    return '^';
  }
  return '.';
}
