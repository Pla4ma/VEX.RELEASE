import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../components/primitives/Text';
import { VexSurface } from '../../shared/ui/vex/VexSurface';
import { vexFire } from '../../theme/tokens/vex-fire';
import type { Theme } from '../../theme/types';

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
  theme: Theme;
  rankDisplay: { icon: string; title: string };
  totalMasteryPoints: number;
  challenges: Challenge[];
}

export const ProfileMasterySheet: React.ComponentType<ProfileMasterySheetProps> = ({
  theme,
  rankDisplay,
  totalMasteryPoints,
  challenges,
}) => (
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: theme.spacing[5],
      paddingVertical: theme.spacing[4],
      gap: theme.spacing[4],
    }}
  >
    <Text
      style={{
        color: vexFire.cream,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
      }}
    >
      {`${rankDisplay.icon} ${rankDisplay.title}`}
    </Text>
    <Text
      style={{
        color: vexFire.textSecondary,
        fontSize: 14,
      }}
    >
      {`${totalMasteryPoints} total mastery points`}
    </Text>
    {challenges.length > 0 ? (
      challenges.slice(0, 3).map((challenge) => (
        <VexSurface key={challenge.id} tone="base" style={{ padding: theme.spacing[4], backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong }}>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: vexFire.cream,
                fontSize: 16,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              {challenge.title}
            </Text>
            <Text
              style={{
                color: vexFire.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {challenge.description}
            </Text>
            <View style={{ marginTop: 12 }}>
              <View style={{ backgroundColor: vexFire.backgroundSoft, borderRadius: theme.borderRadius.full, height: theme.spacing[2], overflow: 'hidden' }}><View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: '100%', width: `${Math.min(100, Math.max(0, (challenge.current / Math.max(1, challenge.target)) * 100))}%` }} /></View>
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
                  color: vexFire.textMuted,
                  fontSize: 12,
                }}
              >
                {`${challenge.current}/${challenge.target} ${challenge.unit}`}
              </Text>
              <Text
                style={{
                  color: vexFire.amber,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {`+${challenge.masteryPoints} MP`}
              </Text>
            </View>
          </View>
        </VexSurface>
      ))
    ) : (
      <VexSurface tone="base" style={{ padding: theme.spacing[4], backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong }}>
        <Text
          style={{
            color: vexFire.textSecondary,
            fontSize: 14,
          }}
        >
          Complete sessions to unlock mastery challenges
        </Text>
      </VexSurface>
    )}
  </ScrollView>
);
