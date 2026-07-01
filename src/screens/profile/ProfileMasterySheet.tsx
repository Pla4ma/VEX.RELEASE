import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassProgressBar } from '../../components/glass/GlassProgressBar';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface Challenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  masteryPoints: number;
}

interface ProfileMasterySheetProps {
  theme: unknown;
  rankDisplay: { icon: string; title: string };
  totalMasteryPoints: number;
  challenges: Challenge[];
}

export const ProfileMasterySheet: React.ComponentType<ProfileMasterySheetProps> = ({
  rankDisplay,
  totalMasteryPoints,
  challenges,
}) => (
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
    }}
  >
    <Text
      style={{
        color: vexLightGlass.text.primary,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
      }}
    >
      {`${rankDisplay.icon} ${rankDisplay.title}`}
    </Text>
    <Text
      style={{
        color: vexLightGlass.text.secondary,
        fontSize: 14,
      }}
    >
      {`${totalMasteryPoints} total mastery points`}
    </Text>
    {challenges.length > 0 ? (
      challenges.slice(0, 3).map((challenge) => (
        <GlassCard key={challenge.id} variant="default" padding={16} radius={22}>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 16,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              {challenge.title}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {challenge.description}
            </Text>
            <View style={{ marginTop: 12 }}>
              <GlassProgressBar
                value={challenge.current}
                max={challenge.target}
                height={8}
                variant="mint"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.text.tertiary,
                  fontSize: 12,
                }}
              >
                {`${challenge.current}/${challenge.target} ${challenge.unit}`}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.mint[700],
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {`+${challenge.masteryPoints} MP`}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))
    ) : (
      <GlassCard variant="default" padding={16} radius={22}>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 14,
          }}
        >
          Complete sessions to unlock mastery challenges
        </Text>
      </GlassCard>
    )}
  </ScrollView>
);
