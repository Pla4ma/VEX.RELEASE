import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { lightColors } from '@/theme/tokens/colors';

import { RECENT_SEARCHES } from '../searchData';

interface RecentSearchesProps {
  onSelect: (search: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSelect }) => {
  const { theme } = useTheme();

  return (
    <Box mb={24}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={12}
      >
        <Text variant="h4">Recent Searches</Text>
        <Pressable
          accessibilityLabel="Clear all recent searches"
          accessibilityRole="button"
          accessibilityHint="Clears all recent searches"
        >
          <Text variant="caption" style={{ color: theme.colors.primary[500] }}>
            Clear All
          </Text>
        </Pressable>
      </Box>
      {RECENT_SEARCHES.map((search, index) => (
        <Pressable
          key={search.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: lightColors.surface.pressed,
          }}
          onPress={() => onSelect(search)}
          accessibilityLabel={`Search for ${search}`}
          accessibilityRole="button"
          accessibilityHint="Activates this search"
        >
          <Icon name="clock" size={18} color={theme.colors.text.tertiary} />
          <Text variant="body" style={{ marginLeft: 12, flex: 1 }}>
            {search}
          </Text>
          <Icon
            name="arrow-right"
            size={18}
            color={theme.colors.text.tertiary}
          />
        </Pressable>
      ))}
    </Box>
  );
};
