import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Box, Text } from '../../../components/primitives/Box';

interface TrendingTagsProps {
  onSelect: (tag: string) => void;
}

const TRENDING_TAGS = [
  'mindfulness',
  'productivity',
  'sleep',
  'focus',
  'meditation',
  'yoga',
] as const;

export const TrendingTags: React.FC<TrendingTagsProps> = ({ onSelect }) => {
  const { theme } = useTheme();

  return (
    <Box mt={8}>
      <Text variant="h4" style={{ marginBottom: 12 }}>
        Trending
      </Text>
      <Box flexDirection="row" flexWrap="wrap" gap={8}>
        {TRENDING_TAGS.map((tag) => (
          <Pressable
            key={tag}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: theme.colors.background.secondary,
            }}
            onPress={() => onSelect(tag)}
            accessibilityLabel={`${tag} tag`}
            accessibilityRole="button"
            accessibilityHint={`Search for ${tag}`}
          >
            <Text variant="caption" style={{ textTransform: 'capitalize' }}>
              #{tag}
            </Text>
          </Pressable>
        ))}
      </Box>
    </Box>
  );
};
