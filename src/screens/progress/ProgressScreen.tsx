import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { useAuthStore } from '../../store';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useFeatureAccess } from '../../features/liveops-config';
import { resolveMonthlyReportAction } from './progress-actions';
import { StudyOSCard } from './StudyOSCard';
import { ReferenceCard } from '../reference-ui/ReferenceCard';
import { ReferenceChart } from '../reference-ui/ReferenceChart';
import { ReferenceHeader } from '../reference-ui/ReferenceHeader';
import { ReferenceMetric } from '../reference-ui/ReferenceMetric';
import { Text } from '../../components/primitives/Text';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { VexAssetImage } from '../../components/glass/VexAssetImage';
import { Icon } from '../../icons';
import { ref, type } from '../reference-ui/referenceTokens';

export function ProgressScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const canOpenStudy = disclosure.features.content_study.isUnlocked;
  const monthlyReportAction = resolveMonthlyReportAction(
    disclosure.features.premium_paywall,
  );

  const openSession = (): void => {
    navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
  };

  const openStudy = (): void => {
    if (canOpenStudy) {
      navigation.navigate('ContentStudy');
      return;
    }
    openSession();
  };

  const score = focusDashboardModel.current?.currentScore ?? 82;

  return (
    <GlassScreen showAura variant="progress">
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: insets.bottom + 200,
          paddingHorizontal: 12,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ReferenceHeader
          eyebrow="PROGRESS"
          title="Your focus record."
          body="Focus sessions, study work, and coaching signals in one place."
          onAction={() => navigation.navigate('Notifications')}
        />
        <ReferenceCard accent="fire" glow showAsset={false}>
          <View pointerEvents="none" style={{ position: 'absolute', right: 12, top: 18, zIndex: 1 }}>
            <VexAssetImage name="orangeAnalytics" size={82} opacity={0.92} />
          </View>
          <Text style={type.title}>Focus Score</Text>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 6 }}>
            <Text
              style={{
                color: ref.ink,
                fontSize: 46,
                fontWeight: '600',
                letterSpacing: 0,
                lineHeight: 52,
              }}
            >
              {score}
            </Text>
            <View style={{ gap: 5, justifyContent: 'center' }}>
              <Text style={[type.body, { color: ref.mintDark }]}>Stable</Text>
              <Text style={type.body}>Last session +6</Text>
              <Text style={type.body}>30-day trend +14</Text>
            </View>
          </View>
          <ReferenceChart />
        </ReferenceCard>

        <ReferenceCard showAsset={false}>
          <Text style={type.title}>Factor map</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            <ReferenceMetric label="Consistency" tone="fire" value="84" progress={0.84} />
            <ReferenceMetric label="Streak stability" value="78" progress={0.78} />
            <ReferenceMetric label="Session quality" tone="fire" value="82" progress={0.82} />
            <ReferenceMetric label="Intentional difficulty" value="75" progress={0.75} />
            <ReferenceMetric label="Recency" tone="fire" value="80" progress={0.8} />
          </View>
        </ReferenceCard>

        <ReferenceCard accent="fire" asset="coachStar">
          <Text style={type.title}>What changed</Text>
          <Text style={[type.body, { marginTop: 6 }]}>
            Cleaner starts improved your rhythm. Next target: 100.
          </Text>
          <View style={{ marginTop: 10 }}>
            <LiquidButton
              accessibilityHint="Open monthly focus report"
              accessibilityLabel="Open monthly report"
              label="Open monthly report"
              onPress={() => {
            if (monthlyReportAction === 'paywall') {
              navigation.navigate('Paywall', {
                gatedFeature: 'monthly_focus_report',
                source: 'focus-monthly-report',
              });
              return;
            }
            openSession();
          }}
              rightIcon={<Icon color={ref.mintDark} name="arrowRight" size="sm" />}
              size="sm"
              variant="outline"
            />
          </View>
        </ReferenceCard>

        <ReferenceCard accent="fire" asset="orangePrism">
          <Text style={type.kicker}>PROGRESSION</Text>
          <Text style={[type.hero, { marginTop: 6 }]}>Level 7</Text>
          <ReferenceMetric label="450 XP to Level 8" tone="fire" value="2.0x" progress={0.72} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <LiquidButton
              accessibilityHint="Start a focus session"
              accessibilityLabel="Start session"
              label="Start session"
              onPress={openSession}
              rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
              size="sm"
              variant="fire"
            />
          </View>
        </ReferenceCard>
        <StudyOSCard canOpenStudy={canOpenStudy} onOpenStudy={openStudy} />
      </ScrollView>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(ProgressScreen, 'Progress');

