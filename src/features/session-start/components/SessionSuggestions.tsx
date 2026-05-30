/**
 * SessionSuggestions Component
 *
 * AI-generated session suggestions based on user patterns.
 * Shows top 2 recommendations from homeSpineService.
 *
 * @phase 1B.4
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { SuggestionCard } from "./SuggestionCard";
import { SuggestionsSkeleton } from "./SuggestionsSkeleton";
import type { SessionSuggestionsProps } from "./session-suggestions-types";

export type { SessionSuggestion, SessionSuggestionsProps } from "./session-suggestions-types";

/**
 * Main session suggestions component
 */
export function SessionSuggestions({
  suggestions,
  onSelectSuggestion,
  isLoading,
  error,
  isExpanded = false,
  onToggleExpand,
}: SessionSuggestionsProps): JSX.Element | null {
  const { theme } = useTheme();

  // Hide silently on error or no suggestions
  if (error || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Pressable
        onPress={onToggleExpand}
        accessibilityLabel="🤖 SUGGESTIONS › button"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={isExpanded ? "md" : undefined}
        >
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>🤖</Text>
            <Text variant="label" color="text.secondary">
              SUGGESTIONS
            </Text>
          </Box>
          <Text
            fontSize={20}
            color={theme.colors.text.tertiary}
            style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }}
          >
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
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  index={index}
                  onPress={() => onSelectSuggestion(suggestion)}
                />
              ))}
            </Box>
          )}
        </Animated.View>
      )}

      {/* Preview when collapsed */}
      {!isExpanded && !isLoading && suggestions.length > 0 && (
        <Box mt="xs">
          <Text variant="caption" color="text.tertiary">
            {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""}{" "}
            based on your patterns
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default SessionSuggestions;
