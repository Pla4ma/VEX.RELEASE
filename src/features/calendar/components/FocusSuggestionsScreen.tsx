/**
 * Focus Suggestions Screen
 *
 * UI for AI-powered study time suggestions.
 * Shows optimal study times based on calendar and patterns.
 *
 * @phase 4
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { LoadingState } from '../../../components/states';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('calendar:focus-suggestions-screen');

// ============================================================================
// Types
// ============================================================================

interface FocusSuggestion {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  confidence: number; // 0-100
  factors: string[];
  conflicts: string[];
  isRecommended: boolean;
  isBooked: boolean;
}

interface PatternInsight {
  type: 'PRODUCTIVITY' | 'AVAILABILITY' | 'ENERGY';
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// Component
// ============================================================================

export const FocusSuggestionsScreen: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [scheduling, setScheduling] = React.useState<string | null>(null);

  // Mock data - would come from smart scheduler service
  const suggestions: FocusSuggestion[] = useMemo(() => [
    {
      id: 'suggestion-1',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      confidence: 95,
      factors: ['High energy time', 'No conflicts', 'Historical productivity'],
      conflicts: [],
      isRecommended: true,
      isBooked: false,
    },
    {
      id: 'suggestion-2',
      date: new Date(),
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      confidence: 85,
      factors: ['Good focus environment', 'Low distraction risk'],
      conflicts: ['Meeting at 3:45 PM'],
      isRecommended: false,
      isBooked: false,
    },
    {
      id: 'suggestion-3',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '10:00',
      endTime: '11:30',
      duration: 90,
      confidence: 90,
      factors: ['Morning productivity', 'No calendar conflicts'],
      conflicts: [],
      isRecommended: true,
      isBooked: false,
    },
  ], []);

  const insights: PatternInsight[] = useMemo(() => [
    {
      type: 'PRODUCTIVITY',
      title: 'Peak Focus Time',
      description: 'Your most productive hours',
      value: '9:00 AM - 11:00 AM',
      trend: 'stable',
    },
    {
      type: 'AVAILABILITY',
      title: 'Study Availability',
      description: 'Available study time this week',
      value: '12.5 hours',
      trend: 'up',
    },
    {
      type: 'ENERGY',
      title: 'Energy Patterns',
      description: 'Best energy levels',
      value: 'Morning',
      trend: 'up',
    },
  ], []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Would refresh suggestions and insights
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleScheduleSession = useCallback(async (suggestionId: string) => {
    setScheduling(suggestionId);
    try {
      // Would schedule study session
      debug.info('Scheduling session from suggestion', { suggestionId });
      // Simulate scheduling
      setTimeout(() => {
        setScheduling(null);
        debug.info('Session scheduled', { suggestionId });
      }, 2000);
    } catch (error) {
      debug.error('Failed to schedule session', error);
      setScheduling(null);
    }
  }, []);

  const handleDismissSuggestion = useCallback(async (suggestionId: string) => {
    try {
      // Would dismiss suggestion and provide feedback
      debug.info('Dismissing suggestion', { suggestionId });
      // Simulate dismissal
      setTimeout(() => {
        debug.info('Suggestion dismissed', { suggestionId });
      }, 500);
    } catch (error) {
      debug.error('Failed to dismiss suggestion', error);
    }
  }, []);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return theme.colors.success.DEFAULT;
    if (confidence >= 70) return theme.colors.warning.DEFAULT;
    return theme.colors.text.secondary;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return theme.colors.success.DEFAULT;
      case 'down': return theme.colors.error.DEFAULT;
      default: return theme.colors.text.secondary;
    }
  };

  // ============================================================================
  // Render Suggestion Card
  // ============================================================================

  const renderSuggestionCard = (suggestion: FocusSuggestion) => (
    <Card
      key={suggestion.id}
      variant={suggestion.isRecommended ? 'elevated' : 'outlined'}
      padding="lg"
      background={suggestion.isRecommended ? 'card' : 'secondary'}
      style={{
        borderLeftWidth: suggestion.isRecommended ? 4 : 1,
        borderLeftColor: suggestion.isRecommended 
          ? theme.colors.primary.DEFAULT 
          : theme.colors.border.DEFAULT,
      }}
    >
      <VStack gap="md">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack gap="xs">
            <HStack gap="sm" align="center">
              <Text variant="body" weight="semibold">
                {suggestion.date.toLocaleDateString()}
              </Text>
              {suggestion.isRecommended && (
                <View
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                  }}
                >
                  <Text
                    variant="caption"
                    color="inverse"
                    weight="semibold"
                  >
                    RECOMMENDED
                  </Text>
                </View>
              )}
            </HStack>
            <Text variant="body" size="lg" weight="semibold">
              {suggestion.startTime} - {suggestion.endTime}
            </Text>
          </VStack>
          
          <VStack align="flex-end" gap="xs">
            <Text variant="caption" color="secondary">
              {suggestion.duration} min
            </Text>
            <HStack gap="xs" align="center">
              <Text
                variant="caption"
                weight="semibold"
                color={getConfidenceColor(suggestion.confidence)}
              >
                {suggestion.confidence}%
              </Text>
              <Text variant="caption" color="secondary">
                match
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* Factors */}
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
          }}
        >
          <VStack gap="sm">
            <Text variant="body" size="sm" color="secondary">
              Why this time works:
            </Text>
            {suggestion.factors.map((factor, index) => (
              <HStack key={index} gap="sm" align="center">
                <Icon
                  name="check-circle"
                  size={16}
                  color={theme.colors.success.DEFAULT}
                />
                <Text variant="body" size="sm">
                  {factor}
                </Text>
              </HStack>
            ))}
          </VStack>
        </View>

        {/* Conflicts */}
        {suggestion.conflicts.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.error.DEFAULT + '20',
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
            }}
          >
            <VStack gap="sm">
              <Text variant="body" size="sm" color="error">
                Potential conflicts:
              </Text>
              {suggestion.conflicts.map((conflict, index) => (
                <HStack key={index} gap="sm" align="center">
                  <Icon
                    name="alert-triangle"
                    size={16}
                    color={theme.colors.error.DEFAULT}
                  />
                  <Text variant="body" size="sm">
                    {conflict}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </View>
        )}

        {/* Actions */}
        <HStack gap="sm">
          <Button
            variant="primary"
            flex={1}
            onPress={() => handleScheduleSession(suggestion.id)}
            disabled={scheduling === suggestion.id || suggestion.isBooked}
            leftIcon={
              scheduling === suggestion.id ? (
                <Icon name="loader" size={16} color={theme.colors.text.inverse} />
              ) : (
                <Icon name="calendar-plus" size={16} color={theme.colors.text.inverse} />
              )
            }
          >
            {scheduling === suggestion.id 
              ? 'Scheduling...' 
              : suggestion.isBooked 
              ? 'Already Booked' 
              : 'Schedule Session'}
          </Button>
          {!suggestion.isRecommended && (
            <Button
              variant="ghost"
              onPress={() => handleDismissSuggestion(suggestion.id)}
              leftIcon={<Icon name="x" size={16} color={theme.colors.text.secondary} />}
            >
              Dismiss
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );

  // ============================================================================
  // Render Insight Card
  // ============================================================================

  const renderInsightCard = (insight: PatternInsight) => (
    <Card
      key={insight.type}
      variant="outlined"
      padding="md"
      background="secondary"
    >
      <VStack gap="sm">
        <HStack justify="space-between" align="center">
          <Text variant="body" weight="semibold">
            {insight.title}
          </Text>
          <HStack gap="xs" align="center">
            <Icon
              name={getTrendIcon(insight.trend)}
              size={16}
              color={getTrendColor(insight.trend)}
            />
            <Text
              variant="caption"
              color={getTrendColor(insight.trend)}
              weight="semibold"
            >
              {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
            </Text>
          </HStack>
        </HStack>
        <Text variant="caption" color="secondary">
          {insight.description}
        </Text>
        <Text variant="body" weight="semibold">
          {insight.value}
        </Text>
      </VStack>
    </Card>
  );

  // ============================================================================
  // Main UI
  // ============================================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <Text variant="heading">Focus Suggestions</Text>
          <Text variant="body" color="secondary">
            AI-powered study time recommendations based on your calendar and patterns.
          </Text>
        </VStack>

        {/* Pattern Insights */}
        <VStack gap="md">
          <Text variant="heading" size="md">
            Your Study Patterns
          </Text>
          <HStack gap="md">
            {insights.map(renderInsightCard)}
          </HStack>
        </VStack>

        {/* Focus Suggestions */}
        <VStack gap="md">
          <HStack justify="space-between" align="center">
            <Text variant="heading" size="md">
              Suggested Study Times
            </Text>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="settings" size={14} color={theme.colors.primary.DEFAULT} />}
            >
              Preferences
            </Button>
          </HStack>
          
          {suggestions.map(renderSuggestionCard)}
        </VStack>

        {/* Settings Section */}
        <Card variant="outlined" padding="md" background="secondary">
          <VStack gap="sm">
            <Text variant="heading" size="sm">
              Suggestion Settings
            </Text>
            <Text variant="body" color="secondary">
              Customize how we suggest study times based on your preferences.
            </Text>
            <HStack gap="sm">
              <Button
                variant="ghost"
                size="sm"
                flex={1}
                leftIcon={<Icon name="clock" size={14} color={theme.colors.text.secondary} />}
              >
                Time Preferences
              </Button>
              <Button
                variant="ghost"
                size="sm"
                flex={1}
                leftIcon={<Icon name="brain" size={14} color={theme.colors.text.secondary} />}
              >
                AI Settings
              </Button>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
};
