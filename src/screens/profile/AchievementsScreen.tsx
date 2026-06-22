import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text } from '@/components/primitives';
import { Skeleton } from '@/shared/ui/primitives';
import { useTheme } from '@/theme';
import { useAchievements, achievementKeys } from '@/features/achievements/hooks';
import { useAchievementStats } from '@/features/achievements/hooks-computed';
import type { AchievementCategory, AchievementRarity } from '@/features/achievements/types';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import type { ExtendedRootStackParams } from '@/navigation/types';
import { navigateToRootScreen } from '../../navigation/navigation-helpers';
import { AchievementsHeader } from './AchievementProgressBar';
import { CategoryTabs, FilterSortBar, type FilterType, type SortType } from './AchievementSearchFilter';
import { AchievementCard, AchievementSkeletonCard, EmptyState, type AchievementWithStatus } from './AchievementCategorySection';

const RARITY_ORDER: AchievementRarity[] = ['LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];
const CATEGORY_ORDER: AchievementCategory[] = ['SESSION', 'STREAK', 'BOSS', 'SOCIAL', 'PROGRESSION', 'ECONOMY'];

const AchievementsScreen = React.memo(() => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? '';
  const { data: achievements, isLoading } = useAchievements(userId);
  const { data: stats } = useAchievementStats(userId);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sort, setSort] = useState<SortType>('RARITY');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithStatus | null>(null);

  const handleStartSession = useCallback(() => {
    navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup', params: {} });
  }, [navigation]);

  const filteredAchievements = useMemo(() => {
    if (!achievements) {return [];}
    let result = [...achievements];
    if (selectedCategory !== 'ALL') {
      result = result.filter((a) => a.category === selectedCategory);
    }
    if (filter === 'UNLOCKED') {
      result = result.filter((a) => a.isUnlocked);
    } else if (filter === 'LOCKED') {
      result = result.filter((a) => !a.isUnlocked);
    }
    result.sort((a, b) => {
      if (sort === 'RARITY') {return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);}
      if (sort === 'RECENT') {return (b.unlockedAt || 0) - (a.unlockedAt || 0);}
      if (sort === 'CATEGORY') {return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);}
      return 0;
    });
    return result;
  }, [achievements, selectedCategory, filter, sort]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: achievementKeys.list(userId) });
  }, [queryClient, userId]);

  const handleAchievementPress = useCallback((achievement: AchievementWithStatus) => {
    setSelectedAchievement(achievement);
  }, []);

  if (isLoading) {
    return (
      <Box flex={1} bg={theme.colors.background.primary}>
        <Box p={4}>
          <Skeleton width={200} height={32} />
          <Skeleton width={150} height={20} />
        </Box>
        <FlashList
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={() => <AchievementSkeletonCard />}
          estimatedItemSize={100}
          keyExtractor={(item: number) => item.toString()}
        />
      </Box>
    );
  }

  if (!filteredAchievements.length) {
    return (
      <Box flex={1} bg={theme.colors.background.primary}>
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        <FilterSortBar filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
        <EmptyState onStartSession={handleStartSession} />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={theme.colors.background.primary}>
      {stats && (
        <AchievementsHeader
          total={stats.total}
          unlocked={stats.unlocked}
          totalPoints={stats.totalPoints}
          pointsEarned={stats.pointsEarned}
        />
      )}
      <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
      <FilterSortBar filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
      {selectedAchievement && (
        <Box p={4} bg={theme.colors.background.secondary} mb={4}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Text variant="h3" color={theme.colors.text.primary}>
                {selectedAchievement.title}
              </Text>
              <Text variant="body" color={theme.colors.text.secondary} mt={1}>
                {selectedAchievement.description}
              </Text>
            </Box>
            <Pressable
              onPress={() => setSelectedAchievement(null)}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
              accessibilityLabel="Close achievements"
              accessibilityRole="button"
              accessibilityHint="Closes the achievement details"
            >
              <Text variant="body" color={theme.colors.text.secondary}>Close</Text>
            </Pressable>
          </Box>
        </Box>
      )}
      <FlashList
        data={filteredAchievements}
        renderItem={({ item }: { item: AchievementWithStatus }) => (
          <AchievementCard achievement={item} onPress={() => handleAchievementPress(item)} />
        )}
        estimatedItemSize={120}
        keyExtractor={(item: AchievementWithStatus) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState onStartSession={handleStartSession} />}
      />
    </Box>
  );
});

AchievementsScreen.displayName = 'AchievementsScreen';

const AchievementsScreenWithBoundary = withScreenErrorBoundary(AchievementsScreen, 'Achievements');
export { AchievementsScreenWithBoundary as AchievementsScreen };

export { AchievementsScreen as default };
