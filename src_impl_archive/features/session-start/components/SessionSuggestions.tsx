/**
 * SessionSuggestions Component
 *
 * AI-generated session suggestions based on user patterns.
 * Shows top 2 recommendations from homeSpineService.
 *
 * @phase 1B.4
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface SessionSuggestion {
  id: string;
  icon: string;
  title: string;
  reasoning: string;
  durationMinutes: number;
  mode: 'solo' | 'squad';
  confidence: number; // 0-1
}

export interface SessionSuggestionsProps {
  /** Suggestions from homeSpineService.getRecommendation() */
  suggestions: SessionSuggestion[];
  /** Callback when user selects a suggestion */
  onSelectSuggestion: (suggestion: SessionSuggestion) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state - component hides silently on error */
  error?: Error | null;
  /** Whether expanded (controlled by parent) */
  isExpanded?: boolean;
  /** Toggle expansion */
  onToggleExpand?: () => void;
}

/**
 * Individual suggestion card
 */
function SuggestionCard({ suggestion, index, onPress }: { suggestion: SessionSuggestion; index: number; onPress: () => void }): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.98, { duration: 100 }), withSpring(1, { damping: 15, stiffness: 200 }));
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(index * 100)} style={animatedStyle}>
      <Pressable onPress={handlePress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box flexDirection="row" alignItems="center" gap="md" p="md" borderRadius="xl" bg={theme.colors.background.secondary} borderWidth={1} borderColor={theme.colors.border.DEFAULT}>
          {/* Icon */}
          <Box width={44} height={44} borderRadius="lg" bg={`${theme.colors.primary[500]}15`} justifyContent="center" alignItems="center">
            <Text fontSize={20}>{suggestion.icon}</Text>
          </Box>

          {/* Content */}
          <Box flex={1} gap="xs">
            <Text variant="body" color="text.primary" fontWeight="600">
              {suggestion.title}
            </Text>
            <Text variant="caption" color="text.secondary" numberOfLines={2}>
              {suggestion.reasoning}
            </Text>
            <Box flexDirection="row" alignItems="center" gap="sm" mt="xs">
              <Box px="sm" py="xs" borderRadius="sm" bg={theme.colors.background.tertiary}>
                <Text variant="caption" color="text.secondary" fontSize={10}>
                  {suggestion.durationMinutes} min
                </Text>
              </Box>
              <Box px="sm" py="xs" borderRadius="sm" bg={theme.colors.background.tertiary}>
                <Text variant="caption" color="text.secondary" fontSize={10}>
                  {suggestion.mode === 'solo' ? '🧘 Solo' : '🛡️ Squad'}
                </Text>
              </Box>
              {suggestion.confidence > 0.8 && <Text fontSize={10}>⭐ Recommended</Text>}
            </Box>
          </Box>

          {/* Arrow */}
          <Text fontSize={20} color={theme.colors.text.tertiary}>
            ›
          </Text>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Skeleton loading state
 */
function SuggestionsSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box gap="sm">
      {[1, 2].map((i) => (
        <Box key={i} flexDirection="row" alignItems="center" gap="md" p="md" borderRadius="xl" bg={theme.colors.background.tertiary}>
          <Box width={44} height={44} borderRadius="lg" bg={theme.colors.background.secondary} />
          <Box flex={1} gap="xs">
            <Box width="60%" height={16} borderRadius="sm" bg={theme.colors.background.secondary} />
            <Box width="80%" height={12} borderRadius="sm" bg={theme.colors.background.secondary} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// Helper for withSequence
function withSequence(...animations: Array<ReturnType<typeof withTiming> | ReturnType<typeof withSpring>>): number {
  return animations[0] as unknown as number;
}

/**
 * Main session suggestions component
 */
export function SessionSuggestions({ suggestions, onSelectSuggestion, isLoading, error, isExpanded = false, onToggleExpand }: SessionSuggestionsProps): JSX.Element | null {
  const { theme } = useTheme();

  // Hide silently on error or no suggestions
  if (error || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Pressable onPress={onToggleExpand} accessibilityLabel="🤖 SUGGESTIONS › button" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb={isExpanded ? 'md' : undefined}>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>🤖</Text>
            <Text variant="label" color="text.secondary">
              SUGGESTIONS
            </Text>
          </Box>
          <Text fontSize={20} color={theme.colors.text.tertiary} style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
            ›
          </Text>
        </Box>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(300)}>
          {isLoading ? (
            <SuggestionsSkeleton />
          ) : (
            <Box gap="sm">
              {suggestions.slice(0, 2).map((suggestion, index) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} onPress={() => onSelectSuggestion(suggestion)} />
              ))}
            </Box>
          )}
        </Animated.View>
      )}

      {/* Preview when collapsed */}
      {!isExpanded && !isLoading && suggestions.length > 0 && (
        <Box mt="xs">
          <Text variant="caption" color="text.tertiary">
            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} based on your patterns
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default SessionSuggestions;
