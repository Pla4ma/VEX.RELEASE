import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useMemo } from 'react';
import { Image, ScrollView } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { ContentStudyStackParamList , StudyContent, ContentStatus, ContentSourceType } from '../types';
import { useContentHistory } from '../hooks';
import { useNetInfo } from '../../../network/useNetInfo';
import { ContentItemCard } from '../components/ContentItemCard';
import { FilterChip } from '../components/FilterChip';
import { EmptyLibraryState } from '../components/EmptyLibraryState';
import { StudyBackButton } from '../components/StudyBackButton';
import { StudyLibraryAction } from '../components/StudyLibraryAction';
import { useContentStudyEligibility } from '../hooks/useContentStudyEligibility';
import { vexFire } from '../../../theme/tokens/vex-fire';
import {
  STATUS_FILTERS,
  TYPE_FILTERS,
} from './StudyLibraryScreen.constants';

type ContentStudyNavigationProp =
  NativeStackNavigationProp<ContentStudyStackParamList>;

function StudyLibraryScreen(): React.ReactNode {
  const navigation = useNavigation<ContentStudyNavigationProp>();
  const { content, isLoading, error, refetch, deleteContent, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useContentHistory();
  const { isOffline } = useNetInfo();
  const eligibility = useContentStudyEligibility();
  const refetchEligibility = eligibility.refetch;
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
    void refetchEligibility();
  }, [refetch, refetchEligibility]);

  const renderContentItem: ListRenderItem<StudyContent> = ({ item, index }) => (
    <ContentItemCard
      content={item}
      index={index}
      onPress={() => handleContentPress(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <Box flex={1} style={{ backgroundColor: vexFire.background }}>
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../../../assets/vex/study/library-codex.png')}
        resizeMode="contain"
        style={{ height: 220, opacity: 0.18, position: 'absolute', right: -48, top: 18, width: 220 }}
      />
      {isOffline ? (
        <Box
          style={{ backgroundColor: vexFire.copper }}
          py="xs"
          px="sm"
          alignItems="center"
          accessibilityLabel="You are offline. Library sync requires a connection."
          accessibilityRole="alert"
        >
          <Text variant="caption" color={vexFire.cream}>
            You are offline. Library sync requires a connection.
          </Text>
        </Box>
      ) : null}
      <Box px="lg" pt="lg" pb="md">
        <StudyBackButton onPress={() => navigation.goBack()} />
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Text variant="h3" style={{ color: vexFire.cream }}>
              Study Library
            </Text>
            <Text variant="caption" style={{ color: vexFire.textSecondary }} mt="xs">
              Showing {content.length} saved {content.length === 1 ? 'item' : 'items'}
            </Text>
          </Box>
          <StudyLibraryAction
            canUpload={eligibility.data?.canUpload ?? false}
            hasContent={content.length > 0}
            isError={eligibility.isError}
            isPending={eligibility.isPending}
            onAddContent={() => navigation.navigate('ContentInput', {})}
            onRetry={() => { void eligibility.refetch(); }}
          />
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
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <EmptyLibraryState
            isLoading={isLoading || eligibility.isPending}
            error={error ?? (eligibility.isError ? 'Could not check content access. Please retry.' : null)}
            errorTitle={eligibility.isError && !error ? 'Study access needs a retry' : 'Could not load your Study Library'}
            hasContent={content.length > 0}
            hasFilteredResults={filteredContent.length > 0}
            onRetry={handleRefresh}
            onAddContent={() => navigation.navigate('ContentInput', {})}
            uploadLocked={eligibility.data?.canUpload === false}
            lockedMessage={eligibility.data?.fallbackLabel}
          />
        }
      />
    </Box>
  );
}

const StudyLibraryScreenWithBoundary = withScreenErrorBoundary(StudyLibraryScreen, 'StudyLibrary');
export { StudyLibraryScreenWithBoundary as StudyLibraryScreen };
