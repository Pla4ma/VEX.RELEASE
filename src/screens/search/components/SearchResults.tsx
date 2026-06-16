import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../../../theme/ThemeContext';
import { Box, Card } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { Badge } from '../../../components/Badge';
import { Icon } from '../../../icons/components/Icon';
import { Skeleton } from '../../../shared/ui/primitives/Skeleton';
import type { SearchResult } from '../searchSchemas';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, query }) => {
  const { theme } = useTheme();

  if (results.length === 0 && query.trim()) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" p={32}>
        <Icon name="search" size={48} color={theme.colors.text.tertiary} />
        <Text variant="h4" style={{ marginTop: 16, textAlign: 'center' }}>
          No Results Found
        </Text>
        <Text
          variant="body"
          color="text.secondary"
          style={{ marginTop: 8, textAlign: 'center' }}
        >
          Try adjusting your search terms
        </Text>
      </Box>
    );
  }

  return (
    <FlashList
      data={results}
      keyExtractor={(item: SearchResult) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      estimatedItemSize={80}
      renderItem={({ item }: { item: SearchResult }) => (
        <Card
          style={{ flexDirection: 'row', alignItems: 'center' }}
          size="md"
          onPress={() => {}}
        >
          <Box
            width={44}
            height={44}
            borderRadius={12}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor:
                item.type === 'session'
                  ? theme.colors.primary[100]
                  : item.type === 'challenge'
                    ? theme.colors.warning.light
                    : item.type === 'user'
                      ? theme.colors.success.light
                      : theme.colors.info.light,
            }}
          >
            <Icon
              name={item.icon}
              size={20}
              color={
                item.type === 'session'
                  ? theme.colors.primary[500]
                  : item.type === 'challenge'
                    ? theme.colors.warning.DEFAULT
                    : item.type === 'user'
                      ? theme.colors.success.DEFAULT
                      : theme.colors.info.DEFAULT
              }
            />
          </Box>
          <Box flex={1} ml={12}>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {item.title}
            </Text>
            <Text variant="caption" color="text.secondary">
              {item.subtitle}
            </Text>
          </Box>
          <Badge
            variant={
              item.type === 'session'
                ? 'primary'
                : item.type === 'challenge'
                  ? 'warning'
                  : item.type === 'user'
                    ? 'success'
                    : 'info'
            }
            size="sm"
          >
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
        </Card>
      )}
      ListEmptyComponent={
        <Box alignItems="center" py={48}>
          <Icon name="search" size={48} color={theme.colors.text.tertiary} />
          <Text variant="h4" style={{ marginTop: 16, textAlign: 'center' }}>
            Start typing to search
          </Text>
          <Text
            variant="body"
            color="text.secondary"
            style={{ marginTop: 8, textAlign: 'center' }}
        >
            Search for sessions, challenges, users, and content
          </Text>
        </Box>
      }
    />
  );
};
