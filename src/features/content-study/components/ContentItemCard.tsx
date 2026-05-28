import React from "react";
import { Pressable, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Icon } from "../../../icons";
import { useTheme } from "../../../theme";
import type { StudyContent } from "../types";
import {
  STATUS_CONFIG,
  SOURCE_TYPE_ICONS,
  statusColor,
} from "../screens/StudyLibraryScreen.constants";

interface ContentItemCardProps {
  content: StudyContent;
  onPress: () => void;
  onDelete: () => void;
  index: number;
}

export function ContentItemCard({
  content,
  onPress,
  onDelete,
  index,
}: ContentItemCardProps): JSX.Element {
  const { theme } = useTheme();
  const status = STATUS_CONFIG[content.status];
  const typeIcon = SOURCE_TYPE_ICONS[content.sourceType];

  const handleDelete = (): void => {
    Alert.alert(
      "Delete Study Content?",
      `This will permanently remove "${content.title || "Untitled"}" and all associated study plans.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  const resolvedStatusColor = statusColor(theme.colors, status.color);

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          p="md"
          mb="sm"
          borderRadius="lg"
          bg="background.secondary"
          borderWidth={1}
          borderColor="border.light"
        >
          <Box flexDirection="row" alignItems="flex-start" gap="md">
            <Box
              width={44}
              height={44}
              borderRadius="md"
              bg="background.tertiary"
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                name={typeIcon}
                size={20}
                color={theme.colors.text.secondary}
              />
            </Box>

            <Box flex={1} gap="xs">
              <Text
                variant="body"
                color="text.primary"
                fontWeight="600"
                numberOfLines={1}
              >
                {content.title || "Untitled Study Content"}
              </Text>

              <Box flexDirection="row" alignItems="center" gap="sm">
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="xs"
                  px="sm"
                  py="xs"
                  borderRadius="sm"
                  style={{
                    backgroundColor: `${resolvedStatusColor}15`,
                  }}
                >
                  <Icon
                    name={status.icon}
                    size={12}
                    color={resolvedStatusColor}
                  />
                  <Text
                    variant="caption"
                    style={{
                      color: resolvedStatusColor,
                      fontWeight: "600",
                    }}
                  >
                    {status.label}
                  </Text>
                </Box>

                <Text variant="caption" color="text.tertiary">
                  {content.sourceType}
                </Text>

                <Text variant="caption" color="text.tertiary">
                  {new Date(content.createdAt).toLocaleDateString()}
                </Text>
              </Box>

              {(content.status === "PENDING" ||
                content.status === "EXTRACTING") && (
                <Box mt="xs">
                  <Text variant="caption" color="text.secondary">
                    {content.status === "PENDING"
                      ? "Waiting to extract..."
                      : "Extracting content..."}
                  </Text>
                </Box>
              )}

              {content.status === "FAILED" && content.errorMessage && (
                <Box mt="xs">
                  <Text
                    variant="caption"
                    color="error.DEFAULT"
                    numberOfLines={2}
                  >
                    {content.errorMessage}
                  </Text>
                </Box>
              )}
            </Box>

            <Pressable
              onPress={handleDelete}
              hitSlop={8}
              accessibilityLabel="Delete content"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Box p="xs">
                <Icon
                  name="trash"
                  size={18}
                  color={theme.colors.error.DEFAULT}
                />
              </Box>
            </Pressable>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}
