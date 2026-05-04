/**
 * Distraction Intervention Component
 *
 * Displays when user's focus is wandering (purity declining, frequent pauses).
 * Offers: REFocus technique, take break, or end session early.
 *
 * @phase 1
 */

import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';
import { Card, Text, Button, VStack, HStack } from '../../../components/primitives';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';
import type { DistractionDetectedInput } from '../intervention-service';

const debug = createDebugger('ai-coach:distraction-ui');

// ============================================================================
// Types
// ============================================================================

export interface DistractionInterventionProps {
  input: DistractionDetectedInput;
  onTryREFocus: () => Promise<void>;
  onTakeBreak: () => Promise<void>;
  onEndEarly: () => Promise<void>;
  onDismiss: () => void;
}

type ActionState = 'idle' | 'refocus' | 'break' | 'ending';

// ============================================================================
// Component
// ============================================================================

export const DistractionIntervention: React.FC<DistractionInterventionProps> = ({
  input,
  onTryREFocus,
  onTakeBreak,
  onEndEarly,
  onDismiss,
}) => {
  const theme = useTheme();
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);

  const { currentPurityScore, pausesInLast10Min, purityScoreTrend } = input;

  const getDistractionReason = (): string => {
    if (purityScoreTrend === 'DECLINING') {
      return 'Your focus quality is dropping';
    }
    if (pausesInLast10Min >= 3) {
      return 'You\'ve paused frequently';
    }
    return 'Your focus seems to be wandering';
  };

  const getSeverityColor = (): string => {
    if (currentPurityScore < 50) return theme.colors.error.DEFAULT;
    if (currentPurityScore < 70) return theme.colors.warning.DEFAULT;
    return theme.colors.info.DEFAULT;
  };

  const handleREFocus = useCallback(async () => {
    try {
      setActionState('refocus');
      setError(null);
      await onTryREFocus();
      debug.info('REFocus technique started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start REFocus';
      setError(message);
      debug.error('REFocus failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [onTryREFocus]);

  const handleBreak = useCallback(async () => {
    try {
      setActionState('break');
      setError(null);
      await onTakeBreak();
      debug.info('Break started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start break';
      setError(message);
      debug.error('Break failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [onTakeBreak]);

  const handleEndEarly = useCallback(async () => {
    try {
      setActionState('ending');
      setError(null);
      await onEndEarly();
      debug.info('Session ended early');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      setError(message);
      debug.error('End session failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [onEndEarly]);

  const isLoading = actionState !== 'idle';
  const severityColor = getSeverityColor();

  return (
    <Card
      variant="elevated"
      padding="lg"
      background="card"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: severityColor,
      }}
    >
      <VStack gap="md">
        {/* Header */}
        <HStack gap="sm" align="center">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.full,
              backgroundColor: `${severityColor}20`, // 20% opacity
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="alert-circle" size={24} color={severityColor} />
          </View>
          <VStack gap="xs" flex={1}>
            <Text variant="heading" size="sm">
              Focus Wandering?
            </Text>
            <Text variant="caption" color="secondary">
              Purity: {currentPurityScore}% • {pausesInLast10Min} pauses recently
            </Text>
          </VStack>
          <TouchableOpacity onPress={onDismiss} disabled={isLoading}>
            <Icon
              name="x"
              size={20}
              color={isLoading ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </HStack>

        {/* Message */}
        <Text variant="body" color="primary">
          {getDistractionReason()}. Want to try the REFocus technique, take a short break, or end the session early?
        </Text>

        {/* Error State */}
        {error && (
          <View
            style={{
              backgroundColor: theme.colors.error.light,
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
            }}
          >
            <Text variant="caption" color="error">
              {error}
            </Text>
          </View>
        )}

        {/* Actions */}
        <VStack gap="sm">
          <Button
            variant="primary"
            onPress={handleREFocus}
            disabled={isLoading}
            loading={actionState === 'refocus'}
            size="sm"
            leftIcon={<Icon name="refresh-cw" size={16} color={theme.colors.text.inverse} />}
          >
            Try REFocus Technique
          </Button>

          <Button
            variant="secondary"
            onPress={handleBreak}
            disabled={isLoading}
            loading={actionState === 'break'}
            size="sm"
            leftIcon={<Icon name="coffee" size={16} color={theme.colors.primary.DEFAULT} />}
          >
            Take a Short Break
          </Button>

          <Button
            variant="ghost"
            onPress={handleEndEarly}
            disabled={isLoading}
            loading={actionState === 'ending'}
            size="sm"
          >
            End Session Early
          </Button>

          <Button
            variant="ghost"
            onPress={onDismiss}
            disabled={isLoading}
            size="sm"
          >
            Push Through
          </Button>
        </VStack>
      </VStack>
    </Card>
  );
};

// ============================================================================
// Loading State
// ============================================================================

export const DistractionInterventionSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Card variant="elevated" padding="lg">
      <VStack gap="md">
        <HStack gap="sm" align="center">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: theme.colors.background.secondary,
            }}
          />
          <View
            style={{
              height: 20,
              width: 140,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: 4,
            }}
          />
        </HStack>
        <View
          style={{
            height: 40,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 4,
          }}
        />
      </VStack>
    </Card>
  );
};
