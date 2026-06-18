import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text } from '@components/primitives';
import { useTheme } from '../../../theme/ThemeContext';
import { useNetInfo } from '../../../network/useNetInfo';
import { useMonthlyReport } from '../hooks';
import { usePremiumStatus } from '../../../shared/monetization/use-revenuecat';
import { useAuthStore } from '../../../store';
import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportContent } from './ReportContent';
import { ReportEmptyState } from './ReportEmptyState';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToRootScreen } from '../../../navigation/navigation-helpers';
import { useFeatureAccess } from '../../liveops-config';
import { resolveMonthlyReportAction } from '../../../screens/progress/progress-actions';

export const MonthlyFocusReportScreen = withScreenErrorBoundary(
  function MonthlyFocusReportScreen(): React.ReactNode {
    const { theme } = useTheme();
    const navigation =
      useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
    const { user } = useAuthStore();
    const userId = user?.id ?? '';
    const { isOffline } = useNetInfo();
    const { isPremium } = usePremiumStatus();
    const featureAccess = useFeatureAccess();
    const monthlyReportAction = resolveMonthlyReportAction(
      featureAccess.features.premium_paywall,
    );

    const now = new Date();
    const { report, isPending, isError, error, refetch } = useMonthlyReport({
      userId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const handleOpenPaywall = () => {
      if (monthlyReportAction !== 'paywall') {
        navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup' });
        return;
      }
      navigateToRootScreen(navigation, 'Paywall', {
        source: 'monthly-report',
        gatedFeature: 'monthly-report',
      });
    };

    if (isPending) {
      return (
        <Box flex={1} bg="background.primary">
          {isOffline ? (
            <Box bg="warning" p="sm" alignItems="center">
              <Text variant="caption" color="text.primary">
                You are offline. Data may be outdated.
              </Text>
            </Box>
          ) : null}
          <Box flex={1} p="md">
            <ReportSkeleton />
          </Box>
        </Box>
      );
    }

    if (isError) {
      return (
        <Box flex={1} bg="background.primary">
          {isOffline ? (
            <Box bg="warning" p="sm" alignItems="center">
              <Text variant="caption" color="text.primary">
                You are offline. Data may be outdated.
              </Text>
            </Box>
          ) : null}
          <Box flex={1} p="md" justifyContent="center" alignItems="center">
            <Text variant="h3" color="text" mb="sm">
              Unable to Load Report
            </Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ textAlign: 'center', marginBottom: 16 }}
            >
              {error?.message ?? 'Something went wrong.'}
            </Text>
            <Text
              onPress={() => refetch()}
              variant="body"
              color="primary"
              style={{ fontWeight: '600' }}
              accessibilityLabel="Retry loading report"
              accessibilityRole="button"
              accessibilityHint="Attempts to reload the monthly focus report"
            >
              Try Again
            </Text>
          </Box>
        </Box>
      );
    }

    if (!report) {
      return (
        <ReportEmptyState
          isOffline={isOffline}
          onStartSession={() => navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup' })}
        />
      );
    }

    return (
      <Box flex={1} bg="background.primary">
        {isOffline ? (
          <Box bg="warning" p="sm" alignItems="center">
            <Text variant="caption" color="text.primary">
              You are offline. Data may be outdated.
            </Text>
          </Box>
        ) : null}

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing[4],
            paddingBottom: theme.spacing[8],
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary[500]}
            />
          }
          accessibilityLabel="Monthly focus report content"
          accessibilityRole="scrollbar"
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mb="md"
          >
            <Text variant="h2" color="text">
              Monthly Focus Report
            </Text>
          </Box>

          <ReportContent
            report={report}
            isPremium={isPremium}
            canOpenPaywall={monthlyReportAction === 'paywall'}
            onOpenPaywall={handleOpenPaywall}
          />
        </ScrollView>
      </Box>
    );
  },
  'MonthlyFocusReport',
);
