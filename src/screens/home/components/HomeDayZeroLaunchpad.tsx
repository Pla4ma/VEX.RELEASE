import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { spacing } from '../../../theme/tokens';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ReferenceMetric } from '../../reference-ui/ReferenceMetric';
import { ref, type } from '../../reference-ui/referenceTokens';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeDayZeroLaunchpadProps {
  onOpenProgress: () => void;
  onStartSession: () => void;
}

export function HomeDayZeroLaunchpad({
  onOpenProgress,
  onStartSession,
}: HomeDayZeroLaunchpadProps): JSX.Element {
  const navigation = useNavigation<Nav>();
  const onOpenCoach = (): void => navigation.navigate('AICoach');

  return (
    <>
      <ReferenceCard accent="fire" asset="coachStar">
        <Text style={type.kicker}>STARTER KIT</Text>
        <Text style={[type.hero, { marginTop: spacing[2], maxWidth: 230 }]}>
          Build your first signal.
        </Text>
        <Text style={[type.body, { marginTop: spacing[2], maxWidth: 238 }]}>
          Pick an intent, run one focused block, then VEX turns it into proof.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing[2],
            marginTop: spacing[4],
          }}
        >
          <LiquidButton
            accessibilityHint="Start your first focus block"
            accessibilityLabel="Start first focus block"
            label="Start block"
            onPress={onStartSession}
            rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
            size="sm"
            variant="fire"
          />
          <LiquidButton
            accessibilityHint="Ask the VEX coach a question"
            accessibilityLabel="Ask coach"
            label="Ask coach"
            onPress={onOpenCoach}
            rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
            size="sm"
            variant="ocean"
          />
          <LiquidButton
            accessibilityHint="Open the baseline preview in progress"
            accessibilityLabel="Preview baseline"
            label="Preview baseline"
            onPress={onOpenProgress}
            size="sm"
            variant="outline"
          />
        </View>
      </ReferenceCard>

      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Pressable
          accessibilityHint="Start your first focus block to create a baseline"
          accessibilityLabel="Baseline card"
          accessibilityRole="button"
          onPress={onStartSession}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <ReferenceCard accent="fire" showAsset={false} style={{ flex: 1 }}>
            <VexAssetImage name="orangeAnalytics" opacity={0.84} size={44} />
            <Text style={[type.title, { marginTop: spacing[2] }]}>Baseline</Text>
            <Text style={[type.body, { marginTop: spacing[1] }]}>
              First block creates your starting score.
            </Text>
            <ReferenceMetric label="ready" tone="fire" value="0/1" progress={0} />
          </ReferenceCard>
        </Pressable>
        <Pressable
          accessibilityHint="Open the AI coach for a quick tip"
          accessibilityLabel="Coach card"
          accessibilityRole="button"
          onPress={onOpenCoach}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <ReferenceCard showAsset={false} style={{ flex: 1 }}>
            <VexAssetImage name="orangeHumanCoach" opacity={0.86} size={44} />
            <Text style={[type.title, { marginTop: spacing[2] }]}>Coach</Text>
            <Text style={[type.body, { marginTop: spacing[1] }]}>
              Calibrates after one real finish.
            </Text>
            <ReferenceMetric label="signal" value="warm" progress={0.18} />
          </ReferenceCard>
        </Pressable>
      </View>

      <ReferenceCard showAsset={false}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing[3],
          }}
        >
          <VexAssetImage name="progressBars" opacity={0.88} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Today has a shape.</Text>
            <Text style={[type.body, { marginTop: spacing[1] }]}>
              One clean start, one finish, one recap. That is enough for Day 0.
            </Text>
          </View>
        </View>
      </ReferenceCard>
    </>
  );
}
