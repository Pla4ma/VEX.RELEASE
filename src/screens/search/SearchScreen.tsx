import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { SearchBar } from './components/SearchBar';
import { CategoriesBar } from './components/CategoriesBar';
import { RecentSearches } from './components/RecentSearches';
import { SearchResults } from './components/SearchResults';
import { TrendingTags } from './components/TrendingTags';
import { searchContent } from './searchRepository';
import { searchDebounceMs } from './searchConfig';
import type { SearchResult } from './searchSchemas';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string, category: string) => {
      if (!searchQuery.trim()) {
        setHasSearched(false);
        setResults([]);
        return;
      }
      Keyboard.dismiss();
      setHasSearched(true);
      setIsSearching(true);
      setError(null);
      try {
        const searchResults = await searchContent({
          query: searchQuery,
          category,
          limit: 20,
        });
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  const handleSearch = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    performSearch(query, activeCategory);
  }, [query, activeCategory, performSearch]);

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (newQuery.trim()) {
        debounceTimer.current = setTimeout(() => {
          performSearch(newQuery, activeCategory);
        }, searchDebounceMs);
      } else {
        setHasSearched(false);
        setResults([]);
      }
    },
    [activeCategory, performSearch],
  );

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    setResults([]);
    setError(null);
    setIsSearching(false);
  };

  const handleSelectSearch = (search: string) => {
    setQuery(search);
    performSearch(search, activeCategory);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          onSubmit={handleSearch}
          onClear={handleClear}
          paddingTop={insets.top + 16}
        />
        <CategoriesBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {!hasSearched ? (
          <Box flex={1} p={16}>
            <RecentSearches onSelect={handleSelectSearch} />
            <TrendingTags onSelect={handleSelectSearch} />
          </Box>
        ) : isSearching ? (
          <Box flex={1} p={16} alignItems="center" justifyContent="center">
            <Text variant="body" color="textSecondary">Searching...</Text>
          </Box>
        ) : error ? (
          <Box flex={1} p={16} alignItems="center" justifyContent="center">
            <Text variant="body" color="error">{error}</Text>
          </Box>
        ) : results.length === 0 ? (
          <Box flex={1} p={16} alignItems="center" justifyContent="center">
            <Text variant="body" color="textSecondary">No results for "{query}"</Text>
          </Box>
        ) : (
          <SearchResults results={results} query={query} />
        )}
      </Box>
    </KeyboardAvoidingView>
  );
};

export default withScreenErrorBoundary(SearchScreen, 'Search');
