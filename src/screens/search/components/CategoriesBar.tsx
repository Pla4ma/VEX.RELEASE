import React from 'react';
import { Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../../../theme';
import { Box, Text } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { launchColors } from '@theme/tokens/launch-colors';
import { CATEGORIES, type SearchCategory } from '../searchData';

interface CategoriesBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const { theme } = useTheme();

  return (
    <Box mb={8}>
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item: SearchCategory) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        estimatedItemSize={40}
        renderItem={({ item }: { item: SearchCategory }) => (
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                activeCategory === item.id
                  ? theme.colors.primary[500]
                  : theme.colors.background.secondary,
            }}
            onPress={() => onCategoryChange(item.id)}
            accessibilityLabel={`${item.label} category`}
            accessibilityRole="button"
            accessibilityHint={`Filter by ${item.label}`}
          >
            <Icon
              name={item.icon}
              size={16}
              color={
                activeCategory === item.id
                  ? launchColors.hex_fff
                  : theme.colors.text.secondary
              }
              style={{ marginRight: 6 }}
            />
            <Text
              variant="caption"
              style={{
                fontWeight: '600',
                color:
                  activeCategory === item.id
                    ? launchColors.hex_fff
                    : theme.colors.text.secondary,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />
    </Box>
  );
};
