import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { CompanionPromiseHomeState } from '../types';
import {
  getModeCopy,
  getBodyCopy,
  getCtaLabel,
} from './CompanionPromiseCard.helpers';
import { Text as VexText } from '../../../components/primitives/Text';

interface CompanionPromiseCardProps {
  onDismissRecovery: () => void;
  onRetry: () => void;
  onStart: () => void;
  state: CompanionPromiseHomeState;
}

export function CompanionPromiseSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.background.elevated,
        borderColor: theme.colors.border.light,
        borderRadius: theme.spacing[4],
        borderWidth: 1,
        padding: theme.spacing[4],
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.spacing[1],
          height: 12,
          width: 120,
        }}
      />
      <View
        style={{
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.spacing[1],
          height: 18,
          marginTop: theme.spacing[3],
          width: '100%',
        }}
      />
      <View
        style={{
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.spacing[1],
          height: 18,
          marginTop: theme.spacing[2],
          width: '82%',
        }}
      />
      <View
        style={{
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.spacing[2],
          height: 44,
          marginTop: theme.spacing[4],
          width: '100%',
        }}
      />
    </View>
  );
}

export function CompanionPromiseCard({
  onDismissRecovery,
  onRetry,
  onStart,
  state,
}: CompanionPromiseCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion ? undefined : FadeInUp.duration(220);

  if (state.kind === 'offline') {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border.light,
          borderRadius: theme.spacing[4],
          borderWidth: 1,
          padding: theme.spacing[4],
        }}
      >
        <Text variant="body" color="text.primary">
          Companion promise is offline.
        </Text>
        <Text
          variant="caption"
          color="text.secondary"
          style={{ marginTop: theme.spacing[2] }}
        >
          Reconnect and we will pull the thread back into focus.
        </Text>
        <Button
          accessibilityHint="Retries loading your companion promise"
          accessibilityLabel="Retry companion promise"
          onPress={onRetry}
          style={[getMinTouchTargetStyle(), { marginTop: theme.spacing[3] }]}
          variant="outline"
        >
          <VexText>Retry</VexText>
        </Button>
      </View>
    );
  }

  return (
    <Animated.View
      entering={entering}
      style={{
        backgroundColor: theme.colors.background.elevated,
        borderColor:
          state.kind === 'fulfilled'
            ? theme.colors.success[500]
            : theme.colors.border.light,
        borderRadius: theme.spacing[4],
        borderWidth: 1,
        padding: theme.spacing[4],
      }}
    >
      {state.showOfflineBanner ? (
        <View
          style={{
            backgroundColor: theme.colors.warning[500],
            borderRadius: theme.spacing[2],
            marginBottom: theme.spacing[3],
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
          }}
        >
          <Text variant="caption" color="text.inverse">
            Offline right now. We will sync the promise when you reconnect.
          </Text>
        </View>
      ) : null}

      <Text variant="caption" color="text.secondary">
        Companion Promise
      </Text>
      <Text
        variant="body"
        color="text.primary"
        style={{ lineHeight: 22, marginTop: theme.spacing[2] }}
      >
        {getBodyCopy(state)}
      </Text>

      {'promise' in state ? (
        <Text
          variant="caption"
          color="text.secondary"
          style={{ marginTop: theme.spacing[2] }}
        >
          {state.promise.targetDurationMinutes} minutes ·{' '}
          {getModeCopy(state.promise.targetMode)}
        </Text>
      ) : null}

      <Button
        accessibilityHint="Starts the promised or recovery session"
        accessibilityLabel={getCtaLabel(state)}
        onPress={onStart}
        style={[getMinTouchTargetStyle(), { marginTop: theme.spacing[4] }]}
      >
        {getCtaLabel(state)}
      </Button>

      {state.kind === 'missed' ? (
        <Button
          accessibilityHint="Dismisses the recovery card"
          accessibilityLabel="Dismiss recovery card"
          onPress={onDismissRecovery}
          style={[getMinTouchTargetStyle(), { marginTop: theme.spacing[2] }]}
          variant="ghost"
        >
          <VexText>Dismiss for now</VexText>
        </Button>
      ) : null}
    </Animated.View>
  );
}
