import React from 'react';
import { View } from 'react-native';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassIconOrb } from '../../components/glass/GlassIconOrb';
import { Icon } from '../../icons';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

type StudyOSCardProps = {
  canOpenStudy: boolean;
  onOpenStudy: () => void;
};

export function StudyOSCard({
  canOpenStudy,
  onOpenStudy,
}: StudyOSCardProps): JSX.Element {
  return (
    <GlassCard variant="premium" padding={20} radius={28}>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.18)',
          borderRadius: 200,
          height: 180,
          position: 'absolute',
          right: -40,
          top: -40,
          width: 180,
        }}
      />
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 14,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            Study OS
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.3,
              lineHeight: 24,
            }}
          >
            {canOpenStudy
              ? 'Turn material into focus sessions'
              : 'Study tools unlock through sessions'}
          </Text>
        </View>
        <GlassIconOrb size={56} variant="mint">
          <Icon color="#0C765F" name="book" size="lg" variant="solid" />
        </GlassIconOrb>
      </View>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 13,
          lineHeight: 19,
          marginTop: 10,
        }}
      >
        Plans, review, and quizzes stay tied to the same start and complete loop.
      </Text>
      <View style={{ marginTop: 14 }}>
        <LiquidButton
          label={canOpenStudy ? 'Open study tools' : 'Start session'}
          onPress={onOpenStudy}
          variant={canOpenStudy ? 'primary' : 'outline'}
          fullWidth
          accessibilityLabel={
            canOpenStudy
              ? 'Open study tools'
              : 'Start session to unlock study tools'
          }
          accessibilityHint="Moves you to the next study or focus action"
        />
      </View>
    </GlassCard>
  );
}
