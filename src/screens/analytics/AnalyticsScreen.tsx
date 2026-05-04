import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnalyticsDashboard } from '../../features/analytics/components';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { usePremiumStatus } from '../../shared/monetization';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import { Skeleton, SkeletonCard, SkeletonList } from '../../components/ui/Skeleton';
import { createSheet } from '@/shared/ui/create-sheet';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function AnalyticsScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { isPremium, isLoading } = usePremiumStatus();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!user || isLoading || isPremium || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    navigation.replace('Paywall', {
      source: 'analytics_screen',
      gatedFeature: 'advanced_analytics',
    });
  }, [isLoading, isPremium, navigation, user]);

  if (!user || isLoading || !isPremium) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        {/* Header Skeleton */}
        <View style={styles.header}>
          <Skeleton width={180} height={28} />
          <Skeleton width={40} height={40} variant="circular" />
        </View>

        {/* Stats Cards Skeleton */}
        <View style={styles.statsRow}>
          <Skeleton width="30%" height={80} variant="rounded" />
          <Skeleton width="30%" height={80} variant="rounded" />
          <Skeleton width="30%" height={80} variant="rounded" />
        </View>

        {/* Chart Skeleton */}
        <View style={styles.chart}>
          <Skeleton width="100%" height={180} variant="rounded" />
        </View>

        {/* List Skeleton */}
        <SkeletonList count={4} itemHeight={60} />
      </View>
    );
  }

  return <AnalyticsDashboard userId={user.id} />;
}

const styles = createSheet({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chart: {
    marginBottom: 24,
  },
});

export default AnalyticsScreen;
