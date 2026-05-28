import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "@/theme";
import { Box, Text, Card } from "@/components/primitives";
import { Icon } from "@/icons";
import { launchColors } from "@theme/tokens/launch-colors";

export type MessageFrequency = "frequent" | "normal" | "minimal";

interface FrequencyOption {
  id: MessageFrequency;
  label: string;
  description: string;
  messagesPerDay: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    id: "frequent",
    label: "Frequent",
    description: "Before, during, and after sessions",
    messagesPerDay: "5-8 messages",
  },
  {
    id: "normal",
    label: "Normal",
    description: "Key moments and milestones",
    messagesPerDay: "2-4 messages",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Only important achievements",
    messagesPerDay: "0-1 messages",
  },
];

interface CoachFrequencySelectorProps {
  frequency: MessageFrequency;
  onFrequencyChange: (freq: MessageFrequency) => void;
}

export const CoachFrequencySelector: React.FC<
  CoachFrequencySelectorProps
> = ({ frequency, onFrequencyChange }) => {
  const { theme } = useTheme();

  return (
    <Box px={16} mb={24}>
      <Text
        variant="caption"
        color="text.secondary"
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        MESSAGE FREQUENCY
      </Text>
      <Card size="sm" style={{ overflow: "hidden" }}>
        {FREQUENCY_OPTIONS.map((option, index) => (
          <React.Fragment key={option.id}>
            <Pressable
              onPress={() => onFrequencyChange(option.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor:
                    frequency === option.id
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                }}
              >
                <Icon
                  name="message-circle"
                  size={20}
                  color={
                    frequency === option.id
                      ? theme.colors.primary[500]
                      : theme.colors.text.tertiary
                  }
                />
              </Box>
              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: frequency === option.id ? "600" : "500",
                    color: theme.colors.text.primary,
                  }}
                >
                  {option.label}
                </Text>
                <Text
                  variant="caption"
                  color="text.secondary"
                  style={{ marginTop: 2 }}
                >
                  {option.description}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    marginTop: 4,
                    color:
                      frequency === option.id
                        ? theme.colors.primary[500]
                        : theme.colors.text.tertiary,
                  }}
                >
                  {option.messagesPerDay}
                </Text>
              </Box>
              {frequency === option.id && (
                <Box
                  width={24}
                  height={24}
                  borderRadius={12}
                  justifyContent="center"
                  alignItems="center"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  <Icon
                    name="check"
                    size={14}
                    color={launchColors.hex_fff}
                  />
                </Box>
              )}
            </Pressable>
            {index < FREQUENCY_OPTIONS.length - 1 && (
              <Box
                height={1}
                ml={68}
                style={{ backgroundColor: theme.colors.border.light }}
              />
            )}
          </React.Fragment>
        ))}
      </Card>
    </Box>
  );
};
