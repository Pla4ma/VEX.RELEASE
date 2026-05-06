/**
 * StudyLibraryScreen
 *
 * Shows all user's saved study content with status indicators.
 * Users can filter by status and type, and delete unwanted content.
 *
 * @phase 10.4
 */

import React, { useState, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Alert } from "react-native";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { Icon } from "../../../icons";
import { useTheme } from "../../../theme";
import type { ContentStudyStackParamList } from "../types";
import type { StudyContent, ContentStatus, ContentSourceType } from "../types";
import { useContentHistory } from "../hooks";
import { Skeleton } from "../components";

type ContentStudyNavigationProp = NativeStackNavigationProp<ContentStudyStackParamList>;

const STATUS_FILTERS: Array<{ label: string; value: ContentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Extracting", value: "EXTRACTING" },
  { label: "Ready", value: "READY" },
];

const TYPE_FILTERS: Array<{ label: string; value: ContentSourceType | "all"; icon: string }> = [
  { label: "All Types", value: "all", icon: "filter" },
  { label: "PDF", value: "PDF", icon: "document" },
  { label: "YouTube", value: "YOUTUBE", icon: "video" },
  { label: "URL", value: "URL", icon: "link" },
  { label: "Text", value: "PASTE", icon: "text" },
];

const STATUS_CONFIG: Record<ContentStatus, { color: string; label: string; icon: string }> = {
  PENDING: { color: "warning", label: "Pending", icon: "clock" },
  EXTRACTING: { color: "info", label: "Extracting", icon: "loader" },
  EXTRACTED: { color: "success", label: "Extracted", icon: "check" },
  PROCESSING: { color: "info", label: "Processing", icon: "loader" },
  READY: { color: "success", label: "Ready", icon: "check-circle" },
  FAILED: { color: "error", label: "Failed", icon: "alert" },
};

const SOURCE_TYPE_ICONS: Record<ContentSourceType, string> = {
  PASTE: "text",
  PDF: "document",
  YOUTUBE: "video",
  URL: "link",
};

/**
 * Content item card
 */
function ContentItemCard({ content, onPress, onDelete, index }: { content: StudyContent; onPress: () => void; onDelete: () => void; index: number }): JSX.Element {
  const { theme } = useTheme();
  const status = STATUS_CONFIG[content.status];
  const typeIcon = SOURCE_TYPE_ICONS[content.sourceType];

  const handleDelete = () => {
    Alert.alert("Delete Study Content?", `This will permanently remove "${content.title || "Untitled"}" and all associated study plans.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box p="md" mb="sm" borderRadius="lg" bg="background.secondary" borderWidth={1} borderColor="border.light">
          <Box flexDirection="row" alignItems="flex-start" gap="md">
            {/* Type Icon */}
            <Box width={44} height={44} borderRadius="md" bg="background.tertiary" justifyContent="center" alignItems="center">
              <Icon name={typeIcon} size={20} color={theme.colors.text.secondary} />
            </Box>

            {/* Content */}
            <Box flex={1} gap="xs">
              <Text variant="body" color="text.primary" fontWeight="600" numberOfLines={1}>
                {content.title || "Untitled Study Content"}
              </Text>

              <Box flexDirection="row" alignItems="center" gap="sm">
                {/* Status Badge */}
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="xs"
                  px="sm"
                  py="xs"
                  borderRadius="sm"
                  style={{
                    backgroundColor: theme.colors[status.color as "success" | "error" | "warning" | "info"]?.DEFAULT ? `${theme.colors[status.color as "success" | "error" | "warning" | "info"].DEFAULT}15` : `${theme.colors.info.DEFAULT}15`,
                  }}
                >
                  <Icon name={status.icon} size={12} color={theme.colors[status.color as "success" | "error" | "warning" | "info"]?.DEFAULT || theme.colors.info.DEFAULT} />
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors[status.color as "success" | "error" | "warning" | "info"]?.DEFAULT || theme.colors.info.DEFAULT,
                      fontWeight: "600",
                    }}
                  >
                    {status.label}
                  </Text>
                </Box>

                {/* Type Label */}
                <Text variant="caption" color="text.tertiary">
                  {content.sourceType}
                </Text>

                {/* Date */}
                <Text variant="caption" color="text.tertiary">
                  {new Date(content.createdAt).toLocaleDateString()}
                </Text>
              </Box>

              {/* Extraction Progress for pending/extracting */}
              {(content.status === "PENDING" || content.status === "EXTRACTING") && (
                <Box mt="xs">
                  <Text variant="caption" color="text.secondary">
                    {content.status === "PENDING" ? "Waiting to extract..." : "Extracting content..."}
                  </Text>
                </Box>
              )}

              {/* Error message for failed */}
              {content.status === "FAILED" && content.errorMessage && (
                <Box mt="xs">
                  <Text variant="caption" color="error.DEFAULT" numberOfLines={2}>
                    {content.errorMessage}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Delete Button */}
            <Pressable onPress={handleDelete} hitSlop={8} accessibilityLabel="Delete content" accessibilityRole="button" accessibilityHint="Activates this control">
              <Box p="xs">
                <Icon name="trash" size={18} color={theme.colors.error.DEFAULT} />
              </Box>
            </Pressable>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Filter chip component
 */
function FilterChip({ label, isActive, onPress, icon }: { label: string; isActive: boolean; onPress: () => void; icon?: string }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: isActive }} accessibilityLabel="Interactive control" accessibilityHint="Activates this control">
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        px="md"
        py="sm"
        borderRadius="full"
        bg={isActive ? "primary.500" : "background.tertiary"}
        style={{
          borderWidth: 1,
          borderColor: isActive ? "transparent" : theme.colors.border.light,
        }}
      >
        {icon && <Icon name={icon} size={14} color={isActive ? "#FFF" : theme.colors.text.secondary} />}
        <Text variant="caption" style={{ color: isActive ? "#FFF" : theme.colors.text.secondary, fontWeight: isActive ? "600" : "400" }}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

/**
 * Main Study Library Screen
 */
export function StudyLibraryScreen(): JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<ContentStudyNavigationProp>();
  const { content, isLoading, error, refetch, deleteContent } = useContentHistory();

  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ContentSourceType | "all">("all");

  // Filter content based on selected filters
  const filteredContent = useMemo(() => {
    return content.filter((item: StudyContent) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.sourceType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [content, statusFilter, typeFilter]);

  const handleContentPress = useCallback(
    (contentId: string) => {
      navigation.navigate("ContentReview", { contentId });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (contentId: string) => {
      deleteContent(contentId);
    },
    [deleteContent],
  );

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);
  const renderContentItem: ListRenderItem<StudyContent> = ({ item, index }) => <ContentItemCard content={item} index={index} onPress={() => handleContentPress(item.id)} onDelete={() => handleDelete(item.id)} />;

  const renderEmptyState = (): JSX.Element | null => {
    if (isLoading) {
      return (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} mb="sm">
              <Skeleton height={80} borderRadius={12} />
            </Box>
          ))}
        </>
      );
    }

    if (error) {
      return (
        <Box alignItems="center" py="xl">
          <Icon name="alert-circle" size={48} color={theme.colors.error.DEFAULT} />
          <Text variant="body" color="error.DEFAULT" mt="md" textAlign="center">
            Failed to load study library
          </Text>
          <Text variant="caption" color="text.secondary" mt="xs" textAlign="center">
            {error}
          </Text>
          <Button variant="outline" size="sm" mt="md" onPress={handleRefresh} accessibilityLabel="Try Again button" accessibilityRole="button" accessibilityHint="Activates this control">
            Try Again
          </Button>
        </Box>
      );
    }

    if (filteredContent.length === 0) {
      return (
        <Box alignItems="center" py="xl">
          <Icon name="book" size={48} color={theme.colors.text.tertiary} />
          <Text variant="body" color="text.secondary" mt="md" textAlign="center">
            {content.length === 0 ? "No study content yet" : "No content matches your filters"}
          </Text>
          {content.length === 0 && (
            <Button variant="primary" size="sm" mt="md" onPress={() => navigation.navigate("ContentInput", {})} accessibilityLabel="Add Your First Content button" accessibilityRole="button" accessibilityHint="Activates this control">
              Add Your First Content
            </Button>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box flex={1} bg="background.primary">
      {/* Header */}
      <Box px="lg" pt="lg" pb="md">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Text variant="h3" color="text.primary">
              Study Library
            </Text>
            <Text variant="caption" color="text.secondary" mt="xs">
              {content.length} saved {content.length === 1 ? "item" : "items"}
            </Text>
          </Box>
          <Button variant="outline" size="sm" onPress={() => navigation.navigate("ContentInput", {})} accessibilityLabel="+ Add New button" accessibilityRole="button" accessibilityHint="Activates this control">
            + Add New
          </Button>
        </Box>
      </Box>

      {/* Status Filters */}
      <Box px="lg" pb="sm">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {STATUS_FILTERS.map((filter) => (
              <FilterChip key={filter.value} label={filter.label} isActive={statusFilter === filter.value} onPress={() => setStatusFilter(filter.value)} />
            ))}
          </Box>
        </ScrollView>
      </Box>

      {/* Type Filters */}
      <Box px="lg" pb="md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {TYPE_FILTERS.map((filter) => (
              <FilterChip key={filter.value} label={filter.label} icon={filter.icon} isActive={typeFilter === filter.value} onPress={() => setTypeFilter(filter.value)} />
            ))}
          </Box>
        </ScrollView>
      </Box>

      <FlashList<StudyContent> data={isLoading || error ? [] : filteredContent} renderItem={renderContentItem} keyExtractor={(item: StudyContent) => item.id} estimatedItemSize={92} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} refreshing={isLoading} onRefresh={handleRefresh} ListEmptyComponent={renderEmptyState} />
    </Box>
  );
}

export default StudyLibraryScreen;
