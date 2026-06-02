import React from 'react';
import { View, Pressable, Share } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useMonthlyReport } from '../hooks';
import { useFocusScoreColor } from '../hooks';
import {
  publishMonthlyReportViewed,
  publishMonthlyReportShared,
  publishMonthlyReportDismissed,
} from '../events';
import { capture } from '../../../shared/analytics/analytics-service';
import { MonthlyReportSkeleton } from './MonthlyReportSkeleton';
import { MonthlyReportErrorState, MonthlyReportEmptyState } from './MonthlyReportStates';
import { useMonthlyReportComputed } from './useMonthlyReportComputed';
import { ReportCards } from './ReportCards';

interface MonthlyFocusReportProps {
  userId: string;
  onClose: () => void;
  visible: boolean;
}

export function MonthlyFocusReport({
  userId,
  onClose,
  visible,
}: MonthlyFocusReportProps) {
  const { theme } = useTheme();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const {
    data: report,
    status: loadingState,
    error,
    refetch: refresh,
  } = useMonthlyReport(userId, year, month);
  const [hasPublishedView, setHasPublishedView] = React.useState(false);

  React.useEffect(() => {
    if (report && !hasPublishedView) {
      publishMonthlyReportViewed(
        userId,
        report.month,
        report.grade,
        report.change,
      );
      setHasPublishedView(true);
    }
  }, [report, hasPublishedView, userId]);

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const scoreColor = useFocusScoreColor(report?.endingScore || null);

  React.useEffect(() => {
    if (visible && report) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [visible, report, scale, opacity]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const { scoreDrivers, identityStatement, percentile } =
    useMonthlyReportComputed(report);

  const handleShare = async () => {
    if (!report) {
      return;
    }
    const shareText = `Monthly Focus Report - ${report.month}\n\n${identityStatement}\n\nScore: ${report.endingScore} (${report.change > 0 ? '+' : ''}${report.change})\nGrade: ${report.grade}\nSessions: ${report.sessionsCompleted}\nPercentile: Top ${100 - percentile}%\n\n${report.highlight}\n\n#VEX #FocusProductivity`;
    try {
      await Share.share({ message: shareText, title: 'Monthly Focus Report' });
      if (report) {
        publishMonthlyReportShared(userId, report.month, report.grade);
      }
    } catch (shareError) {
      if (shareError instanceof Error) {
        capture('monthly_report_share_failed', { error: shareError.message });
      }
    }
  };

  const handleClose = () => {
    if (report) {
      publishMonthlyReportDismissed(userId, report.month);
    }
    onClose();
  };

  if (loadingState === 'loading' || loadingState === 'pending') {
    return <MonthlyReportSkeleton />;
  }

  if (loadingState === 'error') {
    return (
      <MonthlyReportErrorState
        message={error?.message || 'Unable to generate your monthly focus report.'}
        onRetry={refresh}
        onClose={handleClose}
      />
    );
  }

  if (!report) {
    return <MonthlyReportEmptyState onClose={handleClose} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing[6],
          paddingTop: theme.spacing[8],
          paddingBottom: theme.spacing[4],
        }}
      >
        <Text variant="heading2" color="text">
          Monthly Focus Report
        </Text>
        <Pressable
          onPress={handleClose}
          style={{ padding: theme.spacing[2] }}
        >
          <Text variant="heading3" color="textSecondary">
            ✕
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[{ flex: 1 }, animatedStyles]}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[6],
          paddingBottom: theme.spacing[8],
        }}
        showsVerticalScrollIndicator={false}
      >
        <ReportCards
          theme={theme}
          month={report.month}
          endingScore={report.endingScore}
          grade={report.grade}
          change={report.change}
          scoreColor={scoreColor}
          scoreDrivers={scoreDrivers}
          sessionsCompleted={report.sessionsCompleted}
          highlight={report.highlight}
          percentile={percentile}
          identityStatement={identityStatement}
          onShare={handleShare}
          onClose={handleClose}
        />
      </Animated.ScrollView>
    </View>
  );
}
