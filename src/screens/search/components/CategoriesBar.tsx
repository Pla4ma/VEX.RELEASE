import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { lightColors } from '@/theme/tokens/colors';

import { CATEGORIES, type SearchCategory } from '../searchData';

interface CategoriesBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

// Extracted renderItem component to avoid inline renderItem + inline objects + inline handler
function CategoryItem({
  item,
  activeCategory,
  theme,
  onPress,
}: {
  item: SearchCategory;
  activeCategory: string;
  theme: ReturnType<typeof useTheme>['theme'];
  onPress: (id: string) => void;
}): React.JSX.Element {
  const isActive = activeCategory === item.id;
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isActive
          ? theme.colors.primary[500]
          : theme.colors.background.secondary,
      }}
      onPress={() => onPress(item.id)}
      accessibilityLabel={`${item.label} category`}
      accessibilityRole="button"
      accessibilityHint={`Filter by ${item.label}`}
    >
      <Icon
        name={item.icon}
        size={16}
        color={isActive ? lightColors.text.inverse : theme.colors.text.secondary}
        style={{ marginRight: 6 }}
      />
      <Text
        variant="caption"
        style={{
          fontWeight: '600',
          color: isActive ? lightColors.text.inverse : theme.colors.text.secondary,
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export const CategoriesBar: React.ComponentType<CategoriesBarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: SearchCategory }) => (
      <CategoryItem
        item={item}
        activeCategory={activeCategory}
        theme={theme}
        onPress={onCategoryChange}
      />
    ),
    [activeCategory, onCategoryChange, theme],
  );

  const keyExtractor = useCallback((item: SearchCategory) => item.id, []);

  return (
    <Box mb={8}>
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        estimatedItemSize={40}
        renderItem={renderItem}
      />
    </Box>
  );
};
