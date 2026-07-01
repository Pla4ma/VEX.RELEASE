import React from 'react';
import { Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/primitives/Box'
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import type { AchievementCategory } from '@/features/achievements/types';
import { lightColors } from '@/theme/tokens/colors';


export type FilterType = 'ALL' | 'UNLOCKED' | 'LOCKED';
export type SortType = 'RARITY' | 'RECENT' | 'CATEGORY';

type CategoryItem = {
  id: AchievementCategory | 'ALL';
  label: string;
  icon: string;
};

export const CATEGORIES: CategoryItem[] = [
  { id: 'ALL', label: 'All', icon: '🏆' },
  { id: 'SESSION', label: 'Session', icon: '📚' },
  { id: 'STREAK', label: 'Streak', icon: '🔥' },
  { id: 'BOSS', label: 'Boss', icon: '⚔️' },
  { id: 'SOCIAL', label: 'Social', icon: '👥' },
  { id: 'PROGRESSION', label: 'Progression', icon: '📈' },
];

export const CategoryTabs: React.ComponentType<{
  selected: AchievementCategory | 'ALL';
  onSelect: (category: AchievementCategory | 'ALL') => void;
}> = ({ selected, onSelect }) => {
  const { theme } = useTheme();
  return (
    <Box py={2}>
      <FlashList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={100}
        keyExtractor={(item: CategoryItem) => item.id}
        renderItem={({ item }: { item: CategoryItem }) => {
          const isSelected = selected === item.id;
          return (
            <Pressable
              onPress={() => onSelect(item.id)}
              accessibilityLabel="Achievement filter"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Box
                px={4}
                py={2}
                mx={2}
                borderRadius={20}
                bg={
                  isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.background.tertiary
                }
                style={{ opacity: isSelected ? 1 : 0.7 }}
              >
                <Box flexDirection="row" alignItems="center" gap={2}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <Text
                    variant="body"
                    color={
                      isSelected
                        ? lightColors.text.inverse
                        : theme.colors.text.secondary
                    }
                    fontWeight={isSelected ? 'semibold' : 'normal'}
                  >
                    {item.label}
                  </Text>
                </Box>
              </Box>
            </Pressable>
          );
        }}
      />
    </Box>
  );
};

export const FilterSortBar: React.ComponentType<{
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
}> = ({ filter, onFilterChange, sort, onSortChange }) => {
  const { theme } = useTheme();
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      px={4}
      py={2}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      <Box flexDirection="row" gap={2}>
        {(['ALL', 'UNLOCKED', 'LOCKED'] as FilterType[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => onFilterChange(f)}
            accessibilityLabel="Achievement filter"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Box
              px={3}
              py={1}
              borderRadius={12}
              bg={filter === f ? theme.colors.accent.purple : 'transparent'}
              style={{
                borderWidth: 1,
                borderColor:
                  filter === f
                    ? theme.colors.primary[500]
                    : theme.colors.border.DEFAULT,
              }}
            >
              <Text
                variant="caption"
                color={
                  filter === f
                    ? lightColors.text.inverse
                    : theme.colors.text.secondary
                }
              >
                {f === 'ALL' ? 'All' : f === 'UNLOCKED' ? 'Unlocked' : 'Locked'}
              </Text>
            </Box>
          </Pressable>
        ))}
      </Box>

      <Box flexDirection="row" alignItems="center" gap={2}>
        <Text variant="caption" color={theme.colors.text.tertiary}>
          Sort:
        </Text>
        <Pressable
          onPress={() => {
            const sorts: SortType[] = ['RARITY', 'RECENT', 'CATEGORY'];
            const currentIndex = sorts.indexOf(sort);
            const nextIndex =
              currentIndex === -1 ? 0 : (currentIndex + 1) % sorts.length;
            onSortChange(sorts[nextIndex]!);
          }}
          accessibilityLabel="Toggle sort order"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Box flexDirection="row" alignItems="center" gap={1}>
            <Text variant="caption" color={theme.colors.primary[500]}>
              {sort === 'RARITY'
                ? 'Rarity'
                : sort === 'RECENT'
                  ? 'Recent'
                  : 'Category'}
            </Text>
            <Text style={{ fontSize: 12 }}>↕️</Text>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
};
