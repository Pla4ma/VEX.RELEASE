import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useMemo } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { SearchBar } from './components/SearchBar';
import { CategoriesBar } from './components/CategoriesBar';
import { RecentSearches } from './components/RecentSearches';
import { SearchResults } from './components/SearchResults';
import { TrendingTags } from './components/TrendingTags';
import { MOCK_RESULTS } from './searchData';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      return;
    }
    Keyboard.dismiss();
    setHasSearched(true);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
  };

  const handleSelectSearch = (search: string) => {
    setQuery(search);
    setHasSearched(true);
  };

  const filteredResults = useMemo(() => {
    if (!hasSearched) {return [];}
    const lowerQuery = query.toLowerCase();
    return MOCK_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.subtitle.toLowerCase().includes(lowerQuery) ||
        r.type.includes(lowerQuery),
    );
  }, [hasSearched, query]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
          onClear={handleClear}
          paddingTop={insets.top + 16}
        />
        <CategoriesBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {hasSearched ? (
          <SearchResults results={filteredResults} query={query} />
        ) : (
          <Box flex={1} p={16}>
            <RecentSearches onSelect={handleSelectSearch} />
            <TrendingTags onSelect={handleSelectSearch} />
          </Box>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
};

export default withScreenErrorBoundary(SearchScreen, 'Search');
