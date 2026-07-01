/**
 * DataList — ListFooter helper component
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { styles } from './DataList.styles';
import type { Theme } from '../../../theme';

interface ListFooterProps {
  loading: boolean;
  hasMore?: boolean;
  theme: Theme;
}

export const ListFooter: React.ComponentType<ListFooterProps> = ({
  loading,
  hasMore = true,
  theme,
}) => {
  if (!loading && !hasMore) {
    return (
      <View style={styles.footerContainer}>
        <Text variant="caption" color="text.tertiary">
          No more items
        </Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        <Text
          variant="caption"
          color="text.secondary"
          style={styles.footerText}
        >
          Loading more...
        </Text>
      </View>
    );
  }
  return null;
};
