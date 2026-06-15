import React from 'react';
import { Pressable, View } from 'react-native';

import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ReferenceChart } from '../../reference-ui/ReferenceChart';
import { ReferenceMetric } from '../../reference-ui/ReferenceMetric';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Icon } from '../../../icons/components/Icon';
import { ref, type } from '../../reference-ui/referenceTokens';
import { StudyOSCard } from '../StudyOSCard';
import type { MotivationProfile } from '../../../features/liveops-config/feature-access-types';

interface ProgressStatCardsProps {
  score: number;
  canOpenStudy: boolean;
  completedSessions: number;
  motivationProfile?: MotivationProfile | null;
  onOpenFocusScore: () => void;
  onOpenAchievements: () => void;
  onOpenMonthlyReport: () => void;
  onOpenSession: () => void;
  onOpenStudy: () => void;
}

export function ProgressStatCards({
  score,
  canOpenStudy,
  completedSessions,
  motivationProfile,
  onOpenFocusScore,
  onOpenAchievements,
  onOpenMonthlyReport,
  onOpenSession,
  onOpenStudy,
}: ProgressStatCardsProps): React.ReactNode {
  return (
    <>
      <Pressable
        accessibilityHint="Open your focus score dashboard"
        accessibilityLabel="Focus score card"
        accessibilityRole="button"
        onPress={onOpenFocusScore}
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <ReferenceCard accent="fire" glow showAsset={false}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 12,
              top: 18,
              zIndex: 1,
            }}
          >
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
      </Pressable>

      <Pressable
        accessibilityHint="Open your focus score dashboard"
        accessibilityLabel="Factor map card"
        accessibilityRole="button"
        onPress={onOpenFocusScore}
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <ReferenceCard showAsset={false}>
          <Text style={type.title}>Factor map</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            <ReferenceMetric
              label="Consistency"
              tone="fire"
              value="84"
              progress={0.84}
            />
            <ReferenceMetric
              label="Streak stability"
              value="78"
              progress={0.78}
            />
            <ReferenceMetric
              label="Session quality"
              tone="fire"
              value="82"
              progress={0.82}
            />
            <ReferenceMetric
              label="Intentional difficulty"
              value="75"
              progress={0.75}
            />
            <ReferenceMetric
              label="Recency"
              tone="fire"
              value="80"
              progress={0.8}
            />
          </View>
        </ReferenceCard>
      </Pressable>

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
            onPress={onOpenMonthlyReport}
            rightIcon={
              <Icon color={ref.mintDark} name="arrowRight" size="sm" />
            }
            size="sm"
            variant="outline"
          />
        </View>
      </ReferenceCard>

      <ReferenceCard accent="fire" asset="orangePrism">
        <Pressable
          accessibilityHint="Open achievements"
          accessibilityLabel="Level progression card"
          accessibilityRole="button"
          onPress={onOpenAchievements}
          style={({ pressed }) => ({
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <Text style={type.kicker}>PROGRESSION</Text>
          <Text style={[type.hero, { marginTop: 6 }]}>Level 7</Text>
          <ReferenceMetric
            label="450 XP to Level 8"
            tone="fire"
            value="2.0x"
            progress={0.72}
          />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <LiquidButton
            accessibilityHint="Start a focus session"
            accessibilityLabel="Start session"
            label="Start session"
            onPress={onOpenSession}
            rightIcon={
              <Icon color={ref.white} name="arrowRight" size="sm" />
            }
            size="sm"
            variant="fire"
          />
        </View>
      </ReferenceCard>

      <StudyOSCard
        canOpenStudy={canOpenStudy}
        completedSessions={completedSessions}
        motivationProfile={motivationProfile}
        onOpenStudy={onOpenStudy}
      />
    </>
  );
}
