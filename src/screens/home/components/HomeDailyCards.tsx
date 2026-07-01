import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ref, type } from '../../reference-ui/referenceTokens';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
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
  includeDailyFocus?: boolean;
  includeCoachCard?: boolean;
}

export function HomeDailyCards({
  controller: _controller,
  onStartSession,
  includeDailyFocus = true,
  includeCoachCard = true,
}: HomeDailyCardsProps): React.ReactNode {
  const navigation = useNavigation<Nav>();
  return (
    <>
      {includeDailyFocus ? (
        <Pressable
          accessibilityHint="Resume your project session"
          accessibilityLabel="Daily focus card"
          accessibilityRole="button"
          onPress={onStartSession}
          style={({ pressed }) => cardPressStyle(pressed)}
        >
          <ReferenceCard glow showAsset={false}>
            <View style={{ zIndex: 2 }}>
              <Text style={type.kicker}>DAILY FOCUS</Text>
              <Text
                style={[
                  type.hero,
                  {
                    fontFamily: 'Urbanist_900Black',
                    letterSpacing: 0,
                    marginTop: 8,
                    maxWidth: 260,
                  },
                ]}
              >
                Start one clean block.
              </Text>
              <Text style={[type.body, { marginTop: 6, maxWidth: 260 }]}>
                VEX keeps the next move saved. No dashboard loop.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Text style={[type.body, { color: ref.mintDark }]}>
                  Adaptive
                </Text>
                <Text style={[type.body, { color: ref.mintDark }]}>
                  Project Work
                </Text>
              </View>
              <View style={{ marginTop: 16 }}>
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
            </View>
          </ReferenceCard>
        </Pressable>
      ) : null}

      {includeCoachCard ? (
        <Pressable
          accessibilityHint="Open the AI coach"
          accessibilityLabel="AI Coach card"
          accessibilityRole="button"
          onPress={() => navigateToMainStackScreen(navigation, 'AICoach')}
          style={({ pressed }) => cardPressStyle(pressed)}
        >
          <ReferenceCard accent="fire" showAsset={false}>
            <View
              style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}
            >
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
      ) : null}
    </>
  );
}
