import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Box } from '../../components/primitives';
import { SearchBar } from './components/SearchBar';
import { CategoriesBar } from './components/CategoriesBar';
import { RecentSearches } from './components/RecentSearches';
import { SearchResults } from './components/SearchResults';
import { TrendingTags } from './components/TrendingTags';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      return;
    }
    Keyboard.dismiss();
    setIsSearching(true);
    setShowResults(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleSelectSearch = (search: string) => {
    setQuery(search);
    handleSearch();
  };

  return (
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

      {showResults ? (
        <SearchResults isSearching={isSearching} />
      ) : (
        <Box flex={1} p={16}>
          <RecentSearches onSelect={handleSelectSearch} />
          <TrendingTags onSelect={handleSelectSearch} />
        </Box>
      )}
    </Box>
  );
};

export default withScreenErrorBoundary(SearchScreen, 'Search');
