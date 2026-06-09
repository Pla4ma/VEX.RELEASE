import React from 'react';
import { View } from 'react-native';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../components/glass/LiquidGlassSphere';
import { FloatingDroplets } from '../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../components/glass/WaterBubble';
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
    <GlassCard variant="default" padding={12} radius={18}>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.18)',
          borderRadius: 200,
          height: 112,
          position: 'absolute',
          right: -40,
          top: -40,
          width: 112,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 8,
          top: 8,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={24} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 12,
          bottom: 8,
          zIndex: 0,
        }}
      >
        <WaterBubble size={24} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 48,
          bottom: 6,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={12} intensity={0.52} />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'space-between',
        }}
      >
        <LiquidGlassSphere
          color="mint"
          icon={
            <Icon color="#0C765F" name="book" size="sm" variant="solid" />
          }
          intensity={0.88}
          size={48}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 10,
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
              fontSize: 14,
              fontWeight: '800',
              letterSpacing: -0.3,
              lineHeight: 18,
            }}
          >
            {canOpenStudy
              ? 'Turn material into focus sessions'
              : 'Study tools unlock through sessions'}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 11,
          lineHeight: 15,
          marginTop: 6,
        }}
      >
        Plans, review, and quizzes stay tied to the same start and complete loop.
      </Text>
      <View style={{ marginTop: 8, maxWidth: 160 }}>
        <LiquidButton
          label={canOpenStudy ? 'Open study tools' : 'Start session'}
          onPress={onOpenStudy}
          variant={canOpenStudy ? 'primary' : 'outline'}
          size="sm"
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
