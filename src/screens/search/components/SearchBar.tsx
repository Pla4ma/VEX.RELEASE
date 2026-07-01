import React from 'react';
import { TextInput, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box';
import { Icon } from '../../../icons/components/Icon';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  paddingTop: number;
}

export const SearchBar: React.ComponentType<SearchBarProps> = ({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  paddingTop,
}) => {
  const { theme } = useTheme();

  return (
    <Box
      px={16}
      pb={12}
      pt={paddingTop}
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        height={48}
        borderRadius={12}
        px={12}
        style={{ backgroundColor: theme.colors.background.secondary }}
      >
        <Icon
          name="search"
          size={20}
          color={theme.colors.text.tertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            height: '100%',
            color: theme.colors.text.primary,
          }}
          placeholder="Search sessions, challenges, users..."
          placeholderTextColor={theme.colors.text.placeholder}
          value={query}
          onChangeText={onQueryChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={100}
        />
        {query.length > 0 && (
          <Pressable
            onPress={onClear}
            style={{ padding: 4 }}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            accessibilityHint="Clears the search query"
          >
            <Icon name="close" size={18} color={theme.colors.text.tertiary} />
          </Pressable>
        )}
      </Box>
    </Box>
  );
};
