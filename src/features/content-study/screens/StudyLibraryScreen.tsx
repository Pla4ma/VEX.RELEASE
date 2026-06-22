import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import type { ContentStudyStackParamList } from '../types';
import type { StudyContent, ContentStatus, ContentSourceType } from '../types';
import { useContentHistory } from '../hooks';
import { useNetInfo } from '../../../network/useNetInfo';
import { ContentItemCard } from '../components/ContentItemCard';
import { FilterChip } from '../components/FilterChip';
import { EmptyLibraryState } from '../components/EmptyLibraryState';
import {
  STATUS_FILTERS,
  TYPE_FILTERS,
} from './StudyLibraryScreen.constants';
import { Text as VexText } from '../../../components/primitives/Text';

type ContentStudyNavigationProp =
  NativeStackNavigationProp<ContentStudyStackParamList>;

export function StudyLibraryScreen(): React.ReactNode {
  const navigation = useNavigation<ContentStudyNavigationProp>();
  const { content, isLoading, error, refetch, deleteContent } =
    useContentHistory();
  const { isOffline } = useNetInfo();
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>(
    'all',
  );
  const [typeFilter, setTypeFilter] = useState<ContentSourceType | 'all'>(
    'all',
  );

  const filteredContent = useMemo(() => {
    return content.filter((item: StudyContent) => {
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesType =
        typeFilter === 'all' || item.sourceType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [content, statusFilter, typeFilter]);

  const handleContentPress = useCallback(
    (contentId: string) => {
      navigation.navigate('ContentReview', { contentId });
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
    refetch();
  }, [refetch]);

  const renderContentItem: ListRenderItem<StudyContent> = ({ item, index }) => (
    <ContentItemCard
      content={item}
      index={index}
      onPress={() => handleContentPress(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <Box flex={1} bg="background.primary">
      {isOffline ? (
        <Box
          bg="warning.light"
          py="xs"
          px="sm"
          alignItems="center"
          accessibilityLabel="You are offline. Library sync requires a connection."
          accessibilityRole="alert"
        >
          <Text variant="caption" color="text.primary">
            You are offline. Library sync requires a connection.
          </Text>
        </Box>
      ) : null}
      <Box px="lg" pt="lg" pb="md">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Text variant="h3" color="text.primary">
              Study Library
            </Text>
            <Text variant="caption" color="text.secondary" mt="xs">
              {content.length} saved {content.length === 1 ? 'item' : 'items'}
            </Text>
          </Box>
          <Button variant="outline"
            size="sm"
            onPress={() => navigation.navigate('ContentInput', {})}
            accessibilityLabel="Add new content"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>+ Add New</VexText>
          </Button>
        </Box>
      </Box>

      <Box px="lg" pb="sm">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {STATUS_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                isActive={statusFilter === filter.value}
                onPress={() => setStatusFilter(filter.value)}
              />
            ))}
          </Box>
        </ScrollView>
      </Box>

      <Box px="lg" pb="md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {TYPE_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                icon={filter.icon}
                isActive={typeFilter === filter.value}
                onPress={() => setTypeFilter(filter.value)}
              />
            ))}
          </Box>
        </ScrollView>
      </Box>

      <FlashList<StudyContent>
        data={isLoading || error ? [] : filteredContent}
        renderItem={renderContentItem}
        keyExtractor={(item: StudyContent) => item.id}
        estimatedItemSize={92}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyLibraryState
            isLoading={isLoading}
            error={error}
            hasContent={content.length > 0}
            hasFilteredResults={filteredContent.length > 0}
            onRetry={handleRefresh}
            onAddContent={() => navigation.navigate('ContentInput', {})}
          />
        }
      />
    </Box>
  );
}

const StudyLibraryScreenWithBoundary = withScreenErrorBoundary(StudyLibraryScreen, 'StudyLibrary');
export { StudyLibraryScreenWithBoundary as StudyLibraryScreen };
