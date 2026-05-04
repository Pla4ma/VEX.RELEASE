/**
 * Study Stuck Intervention Component
 *
 * Displays when user is stuck on same document section for 30+ minutes.
 * Offers: summarize, quiz, skip section, or dismiss.
 *
 * @phase 1
 */

import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme';
import { Card, Text, Button, VStack, HStack } from '../../../components/primitives';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';
import type { StudyStuckInput } from '../intervention-service';

const debug = createDebugger('ai-coach:study-stuck-ui');

// ============================================================================
// Types
// ============================================================================

export interface StudyStuckInterventionProps {
  input: StudyStuckInput;
  onSummarize: (documentId: string) => Promise<void>;
  onQuiz: (documentId: string) => Promise<void>;
  onSkipSection: (documentId: string, sectionName?: string) => Promise<void>;
  onDismiss: () => void;
}

type ActionState = 'idle' | 'summarizing' | 'quiz' | 'skipping';

// ============================================================================
// Component
// ============================================================================

export const StudyStuckIntervention: React.FC<StudyStuckInterventionProps> = ({
  input,
  onSummarize,
  onQuiz,
  onSkipSection,
  onDismiss,
}) => {
  const theme = useTheme();
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);

  const { documentName, sectionName, minutesOnSameSection } = input;

  const handleSummarize = useCallback(async () => {
    try {
      setActionState('summarizing');
      setError(null);
      await onSummarize(input.documentId);
      debug.info('Summarize requested for', input.documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize';
      setError(message);
      debug.error('Summarize failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [input.documentId, onSummarize]);

  const handleQuiz = useCallback(async () => {
    try {
      setActionState('quiz');
      setError(null);
      await onQuiz(input.documentId);
      debug.info('Quiz requested for', input.documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start quiz';
      setError(message);
      debug.error('Quiz failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [input.documentId, onQuiz]);

  const handleSkip = useCallback(async () => {
    try {
      setActionState('skipping');
      setError(null);
      await onSkipSection(input.documentId, input.sectionName);
      debug.info('Skip section requested for', input.documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to skip section';
      setError(message);
      debug.error('Skip failed:', err);
    } finally {
      setActionState('idle');
    }
  }, [input.documentId, input.sectionName, onSkipSection]);

  const sectionText = sectionName ? ` on "${sectionName}"` : '';
  const isLoading = actionState !== 'idle';

  return (
    <Card
      variant="elevated"
      padding="lg"
      background="card"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning.DEFAULT,
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
              backgroundColor: theme.colors.warning.light,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="help-circle" size={24} color={theme.colors.warning.DEFAULT} />
          </View>
          <VStack gap="xs" flex={1}>
            <Text variant="heading" size="sm">
              Stuck?
            </Text>
            <Text variant="caption" color="secondary">
              {minutesOnSameSection} minutes{sectionText}
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
          You've been on {documentName}{sectionText} for {minutesOnSameSection} minutes.
          Would you like help?
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
            variant="secondary"
            onPress={handleSummarize}
            disabled={isLoading}
            loading={actionState === 'summarizing'}
            size="sm"
            leftIcon={<Icon name="file-text" size={16} color={theme.colors.primary.DEFAULT} />}
          >
            Summarize This Section
          </Button>

          <Button
            variant="secondary"
            onPress={handleQuiz}
            disabled={isLoading}
            loading={actionState === 'quiz'}
            size="sm"
            leftIcon={<Icon name="help-circle" size={16} color={theme.colors.primary.DEFAULT} />}
          >
            Quiz Me on This
          </Button>

          {sectionName && (
            <Button
              variant="ghost"
              onPress={handleSkip}
              disabled={isLoading}
              loading={actionState === 'skipping'}
              size="sm"
            >
              Skip to Next Section
            </Button>
          )}

          <Button
            variant="ghost"
            onPress={onDismiss}
            disabled={isLoading}
            size="sm"
          >
            I'm Fine, Thanks
          </Button>
        </VStack>
      </VStack>
    </Card>
  );
};

// ============================================================================
// Loading State
// ============================================================================

export const StudyStuckInterventionSkeleton: React.FC = () => {
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
              width: 120,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: 4,
            }}
          />
        </HStack>
        <View
          style={{
            height: 60,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 4,
          }}
        />
      </VStack>
    </Card>
  );
};

// ============================================================================
// Empty State (No Intervention Needed)
// ============================================================================

export const StudyStuckInterventionEmpty: React.FC = () => null;
