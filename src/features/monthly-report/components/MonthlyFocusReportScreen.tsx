import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text, Button } from '@components/primitives';
import { useTheme } from '../../../theme';
import { useNetInfo } from '../../../network';
import { useMonthlyReport } from '../hooks';
import { usePremiumStatus } from '../../../shared/monetization/use-revenuecat';
import { useAuthStore } from '../../../store';
import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportContent } from './ReportContent';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useFeatureAccess } from '../../liveops-config';
import { resolveMonthlyReportAction } from '../../../screens/progress/progress-actions';

export const MonthlyFocusReportScreen = withScreenErrorBoundary(
  function MonthlyFocusReportScreen(): JSX.Element {
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
        navigation.navigate('SessionStack', { screen: 'SessionSetup' });
        return;
      }
      navigation.navigate('Paywall', {
        source: 'monthly-report',
        gatedFeature: 'monthly-report',
      });
    };

    if (isPending) {
      return (
        <Box flex={1} bg="background.primary" p="md">
          <ReportSkeleton />
        </Box>
      );
    }

    if (isError) {
      return (
        <Box
          flex={1}
          bg="background.primary"
          p="md"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            variant="h4"
            color="error"
            style={{ marginBottom: theme.spacing[3] }}
          >
            Report Unavailable
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ textAlign: 'center', marginBottom: theme.spacing[4] }}
          >
            {error?.message ??
              'Unable to load your monthly focus report. Give it another shot.'}
          </Text>
          <Button
            onPress={() => refetch()}
            variant="primary"
            accessibilityLabel="Retry loading report"
            accessibilityRole="button"
            accessibilityHint="Attempts to reload the monthly focus report"
          >
            Try Again
          </Button>
        </Box>
      );
    }

    if (!report) {
      return (
        <Box
          flex={1}
          bg="background.primary"
          p="md"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            variant="h3"
            color="text"
            style={{ marginBottom: theme.spacing[3] }}
          >
            No Sessions Yet
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ textAlign: 'center', marginBottom: theme.spacing[4] }}
          >
            Complete focus sessions this month to generate your first monthly
            report.
          </Text>
          <Button
            onPress={() =>
              navigation.navigate('SessionStack', { screen: 'SessionSetup' })
            }
            variant="primary"
            accessibilityLabel="Start a session"
            accessibilityRole="button"
            accessibilityHint="Navigates to session setup"
          >
            Start a session
          </Button>
        </Box>
      );
    }

    return (
      <Box flex={1} bg="background.primary">
        {isOffline ? (
          <Box bg="warning" p="sm" alignItems="center">
            <Text variant="caption" color="onWarning">
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
