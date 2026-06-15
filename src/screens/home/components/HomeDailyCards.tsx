import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
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

interface HomeDailyCardsProps {
  controller: HomeController;
  onStartSession: () => void;
}

export function HomeDailyCards({
  controller,
  onStartSession,
}: HomeDailyCardsProps): React.ReactNode {
  const navigation = useNavigation<Nav>();

  return (
    <>
      <Pressable
        accessibilityHint="Resume your project session"
        accessibilityLabel="Daily focus card"
        accessibilityRole="button"
        onPress={onStartSession}
        style={({ pressed }) => cardPressStyle(pressed)}
      >
        <ReferenceCard glow showAsset={false}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -16,
              top: 6,
              zIndex: 0,
            }}
          >
            <VexAssetImage name="sculpture" size={154} opacity={0.52} />
          </View>
          <View style={{ zIndex: 2 }}>
            <Text style={type.kicker}>DAILY FOCUS</Text>
            <Text style={[type.hero, { marginTop: 8, maxWidth: 220 }]}>
              Your project is waiting.
            </Text>
            <Text style={[type.body, { marginTop: 6, maxWidth: 205 }]}>
              Pick up right where you stopped. The next move is already
              saved.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Text style={[type.body, { color: ref.mintDark }]}>
                Adaptive
              </Text>
              <Text style={[type.body, { color: ref.mintDark }]}>
                Project Work
              </Text>
            </View>
            <View style={{ marginTop: 14 }}>
              <Text style={type.title}>First contract</Text>
              <Text style={[type.body, { marginTop: 4 }]}>
                30 minutes, one clean start.
              </Text>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <LiquidButton
                  accessibilityHint="Resume your project session"
                  accessibilityLabel="Resume project"
                  label="Resume project"
                  onPress={onStartSession}
                  rightIcon={
                    <Icon color={ref.white} name="arrowRight" size="sm" />
                  }
                  size="md"
                  variant="fire"
                />
                <Text style={[type.body, { fontWeight: '800' }]}>
                  ~30 min
                </Text>
              </View>
            </View>
            <Text style={[type.body, { marginTop: 12 }]}>
              Next move is saved. Open the thread.
            </Text>
          </View>
        </ReferenceCard>
      </Pressable>

      <Pressable
        accessibilityHint="Open the AI coach"
        accessibilityLabel="AI Coach card"
        accessibilityRole="button"
        onPress={() => navigation.navigate('AICoach')}
        style={({ pressed }) => cardPressStyle(pressed)}
      >
        <ReferenceCard accent="fire" showAsset={false}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
            <VexAssetImage name="orangeHumanCoach" size={88} />
            <View style={{ flex: 1 }}>
              <Text style={type.title}>AI Coach</Text>
              <Text style={type.body}>
                You built real momentum. Protect this block.
              </Text>
            </View>
            <Icon color={ref.muted} name="chevronRight" size="sm" />
          </View>
        </ReferenceCard>
      </Pressable>
    </>
  );
}
