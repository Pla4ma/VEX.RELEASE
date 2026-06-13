import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../../components/primitives/Text';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ReferenceChart } from '../../reference-ui/ReferenceChart';
import { ReferenceMetric } from '../../reference-ui/ReferenceMetric';
import { ref, type } from '../../reference-ui/referenceTokens';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { HomeController } from '../hooks/home-controller-types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

function cardPressStyle(pressed: boolean) {
  return {
    opacity: pressed ? 0.9 : 1,
    transform: [{ scale: pressed ? 0.985 : 1 }],
  } as const;
}

interface HomeMetricsRowProps {
  controller: HomeController;
  focusScore: number;
}

export function HomeMetricsRow({
  controller,
  focusScore,
}: HomeMetricsRowProps): JSX.Element {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Pressable
        accessibilityHint="Open progress to see streak details"
        accessibilityLabel="Streak card"
        accessibilityRole="button"
        onPress={() => controller.openProgress()}
        style={({ pressed }) => [{ flex: 1 }, cardPressStyle(pressed)]}
      >
        <ReferenceCard accent="fire" showAsset={false}>
          <Text style={type.title}>
            {controller.currentStreak || 7} Day Streak
          </Text>
          <ReferenceMetric
            label="stability"
            tone="fire"
            value="2.0x"
            progress={0.82}
          />
        </ReferenceCard>
      </Pressable>
      <Pressable
        accessibilityHint="Open focus score dashboard"
        accessibilityLabel="Focus score card"
        accessibilityRole="button"
        onPress={() => navigation.navigate('FocusScoreDashboard')}
        style={({ pressed }) => [{ flex: 1 }, cardPressStyle(pressed)]}
      >
        <ReferenceCard accent="fire" showAsset={false}>
          <Text style={type.title}>Focus Score</Text>
          <Text
            style={{
              color: ref.ink,
              fontSize: 34,
              fontWeight: '600',
              lineHeight: 40,
            }}
          >
            {focusScore || 82}
          </Text>
          <ReferenceChart />
        </ReferenceCard>
      </Pressable>
    </View>
  );
}
