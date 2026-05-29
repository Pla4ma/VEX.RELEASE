import React, { useState, useCallback } from "react";
import { Pressable } from "react-native";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { ModeQuickContract, QuickContractQuestion } from "../schemas";
import { useModeQuickContract } from "../hooks";
import type { Lane } from "../../lane-engine/types";

interface ModeQuickContractProps {
  lane: Lane | null | undefined;
  isStarting: boolean;
  onStart: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export function ModeQuickContract({
  lane,
  isStarting,
  onStart,
  onBack,
}: ModeQuickContractProps): JSX.Element {
  const contract = useModeQuickContract(lane);
  const { theme } = useTheme();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const allAnswered = contract.questions.every(
    (q: QuickContractQuestion) => (answers[q.key] ?? "").trim().length >= 3,
  );

  return (
    <Box flex={1} bg="background.primary">
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        px="md"
        pt="lg"
        pb="sm"
      >
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the home screen"
          style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}
        >
          <Text variant="body" color="text.secondary">
            ← Back
          </Text>
        </Pressable>
      </Box>

      {/* Contract content */}
      <Box flex={1} px="lg" pt="xl" gap="xl">
        <Box gap="xs">
          <Text variant="h3" color="text.primary">
            {contract.title}
          </Text>
          <Text variant="bodySmall" color="text.secondary">
            {contract.durationLabel} ~{contract.suggestedDurationMinutes} minutes
          </Text>
        </Box>

        <Box gap="lg">
          {contract.questions.map((q: QuickContractQuestion) => (
            <Box key={q.key} gap="xs">
              <Text variant="label" color="text.primary">
                {q.label}
              </Text>
              <Pressable
                accessibilityLabel={q.label}
                accessibilityRole="text"
                accessibilityHint={`Enter your ${q.label.toLowerCase()}`}
              >
                <Box
                  minHeight={52}
                  px="md"
                  py="md"
                  bg="background.secondary"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor={
                    (answers[q.key] ?? "").trim().length >= 3
                      ? "primary.500"
                      : "border.light"
                  }
                >
                  {/* Read-only placeholder display — input handled via parent state */}
                  <Text
                    variant="body"
                    color={
                      (answers[q.key] ?? "").trim().length >= 3
                        ? "text.primary"
                        : "text.tertiary"
                    }
                  >
                    {(answers[q.key] ?? "").trim().length >= 3
                      ? answers[q.key]
                      : q.placeholder}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          ))}
        </Box>

        {contract.showAdvancedSettings && (
          <Pressable
            onPress={() => setShowAdvanced((prev) => !prev)}
            accessibilityLabel="Toggle advanced settings"
            accessibilityRole="button"
            accessibilityHint="Shows or hides extra session customization options"
          >
            <Box
              minHeight={44}
              justifyContent="center"
              alignItems="center"
              py="sm"
            >
              <Text variant="caption" color="text.tertiary">
                {showAdvanced ? "Hide advanced settings" : "Advanced settings"}
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {/* Start button */}
      <Box px="lg" pb="xl" pt="md">
        <Pressable
          onPress={() => {
            if (allAnswered && !isStarting) {
              onStart(answers);
            }
          }}
          disabled={!allAnswered || isStarting}
          accessibilityLabel={contract.startLabel}
          accessibilityRole="button"
          accessibilityHint={
            allAnswered
              ? `Starts a ${contract.lane} session`
              : "Fill in all questions first"
          }
          style={({ pressed }) => ({
            opacity: !allAnswered || isStarting ? 0.4 : pressed ? 0.85 : 1,
          })}
        >
          <Box
            minHeight={52}
            borderRadius="lg"
            bg="primary.500"
            justifyContent="center"
            alignItems="center"
          >
            <Text
              variant="button"
              color="text.inverse"
              fontWeight="600"
            >
              {isStarting ? "Starting..." : contract.startLabel}
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}
