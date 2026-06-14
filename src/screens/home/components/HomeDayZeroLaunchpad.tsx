import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ref, type } from '../../reference-ui/referenceTokens';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface HomeDayZeroLaunchpadProps {
  onOpenProgress: () => void;
  onStartSession: () => void;
  onOpenPlan: () => void;
  onOpenCoach: () => void;
}

export function HomeDayZeroLaunchpad({
  onOpenProgress,
  onStartSession,
  onOpenPlan,
  onOpenCoach,
}: HomeDayZeroLaunchpadProps): JSX.Element {
  const navigation = useNavigation<Nav>();

  const pathOptions = [
    {
      id: 'focus',
      label: 'Focus',
      description: 'Start a timer and get in the zone',
      icon: 'check-circle',
      color: vexLightGlass.mint[500],
      action: onStartSession,
    },
    {
      id: 'plan',
      label: 'Plan',
      description: 'Organize your week and goals',
      icon: 'calendar',
      color: vexLightGlass.semantic.info,
      action: onOpenPlan,
    },
    {
      id: 'coach',
      label: 'Coach',
      description: 'Get guidance from VEX',
      icon: 'message-circle',
      color: vexLightGlass.semantic.accent,
      action: onOpenCoach,
    },
  ];

  return (
    <>
      <ReferenceCard accent="fire" asset="coachStar">
        <Text style={type.kicker}>WELCOME TO VEX</Text>
        <Text style={[type.hero, { marginTop: spacing[2], maxWidth: 280 }]}>
          How do you want to start?
        </Text>
        <Text style={[type.body, { marginTop: spacing[2], maxWidth: 280 }]}>
          VEX adapts to your style. Pick your first move and the app will learn from there.
        </Text>
      </ReferenceCard>

      <View style={{ flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' }}>
        {pathOptions.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInUp.delay(index * 100)}
            style={{ flex: 1, minWidth: 140 }}
          >
            <Pressable
              accessibilityHint={option.description}
              accessibilityLabel={option.label}
              accessibilityRole="button"
              onPress={option.action}
              style={({ pressed }) => ({
                flex: 1,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
            >
              <ReferenceCard accent="fire" showAsset={false} style={{ flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: option.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing[2],
                  }}
                >
                  <Icon
                    color={option.color}
                    name={option.icon}
                    size="md"
                    variant="solid"
                  />
                </View>
                <Text style={[type.title, { marginTop: spacing[2] }]}>
                  {option.label}
                </Text>
                <Text style={[type.body, { marginTop: spacing[1] }]}>
                  {option.description}
                </Text>
              </ReferenceCard>
            </Pressable>
          </Animated.View>
        ))}
      </View>

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
            <Text style={{ fontSize: 11, color: ref.mintDark, marginTop: spacing[2], fontWeight: '700' }}>
              ready • 0/1
            </Text>
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
            <Text style={{ fontSize: 11, color: ref.mintDark, marginTop: spacing[2], fontWeight: '700' }}>
              signal • warm
            </Text>
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
