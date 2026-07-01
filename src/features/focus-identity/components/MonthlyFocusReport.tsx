import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { useMonthlyReport } from '../hooks';
import { useFocusScoreColor } from '../hooks';
import {
  publishMonthlyReportViewed,
  publishMonthlyReportDismissed,
} from '../events';
import { MonthlyReportSkeleton } from './MonthlyReportSkeleton';
import { MonthlyReportErrorState, MonthlyReportEmptyState } from './MonthlyReportStates';
import { useMonthlyReportComputed } from './useMonthlyReportComputed';
import { ReportCards } from './ReportCards';
import { buildReportSummary, type ReportSummaryDisplay } from './reportSummaryBuilder';
import { shareMonthlyReport } from './shareMonthlyReport';

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
  const reportSummary: ReportSummaryDisplay | undefined = React.useMemo(
    () => (report ? buildReportSummary(report) : undefined),
    [report],
  );
  const prevReportIdRef = React.useRef(report?.id);

  if (report && report.id !== prevReportIdRef.current) {
    prevReportIdRef.current = report.id;
    setHasPublishedView(false);
  }

  React.useEffect(() => {
    if (report && reportSummary && !hasPublishedView) {
      publishMonthlyReportViewed(
        userId,
        reportSummary.month,
        report.grade,
        reportSummary.change,
      );
      setHasPublishedView(true);
    }
  }, [report, reportSummary, hasPublishedView, userId]);

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
    useMonthlyReportComputed(reportSummary);

  const handleShare = async () => {
    if (!report || !reportSummary) {
      return;
    }
    await shareMonthlyReport(reportSummary, identityStatement, report.grade, userId, percentile);
  };

  const handleClose = () => {
    if (report) {
      publishMonthlyReportDismissed(userId, reportSummary?.month ?? String(report.month));
    }
    onClose();
  };

  if (loadingState === 'pending') {
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

  if (!report || !reportSummary) {
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
          accessibilityLabel="Close monthly focus report"
          accessibilityRole="button"
          accessibilityHint="Closes the monthly focus report"
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
          month={reportSummary.month}
          endingScore={report.endingScore}
          grade={report.grade}
          change={reportSummary.change}
          scoreColor={scoreColor}
          scoreDrivers={scoreDrivers}
          sessionsCompleted={reportSummary.sessionsCompleted}
          highlight={reportSummary.highlight}
          percentile={percentile}
          identityStatement={identityStatement}
          onShare={handleShare}
          onClose={handleClose}
        />
      </Animated.ScrollView>
    </View>
  );
}
