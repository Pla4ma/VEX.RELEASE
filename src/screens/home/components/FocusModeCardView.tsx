import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FocusModeOrb } from '../../../components/glass/FocusModeOrb';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons';
import type { FocusModeCard } from '../../../features/session-start/schemas';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function getOrbMode(mode: string): 'sprint' | 'light' | 'study' | 'recovery' {
  switch (mode) {
    case 'sprint-15': return 'sprint';
    case 'light-focus': return 'light';
    case 'study': return 'study';
    case 'recovery': return 'recovery';
    default: return 'sprint';
  }
}

interface FocusModeCardViewProps {
  card: FocusModeCard;
  onPress: () => void;
}

export function FocusModeCardView({
  card,
  onPress,
}: FocusModeCardViewProps): JSX.Element {
  const isPrimary = card.id === 'sprint-15';
  const orbMode = getOrbMode(card.id);

  return (
    <View style={{ marginBottom: 9 }}>
      <GlassCard
        glowMint={isPrimary}
        padding={14}
        radius={22}
        variant={isPrimary ? 'premium' : 'default'}
      >
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 10,
            top: 10,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={3} opacity={0.65} size={28} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 48,
            bottom: 14,
            zIndex: 0,
          }}
        >
          <WaterBubble size={32} opacity={0.65} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            left: 8,
            bottom: 8,
            zIndex: 0,
          }}
        >
          <LiquidGlassSphere color="pearl" size={16} intensity={0.52} />
        </View>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            gap: 12,
            zIndex: 2,
          }}
        >
          <FocusModeOrb
            mode={orbMode}
            size={isPrimary ? 66 : 58}
            intensity={0.95}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: 0,
                lineHeight: 21,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                lineHeight: 17,
                fontWeight: '400',
              }}
            >
              {card.body}
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingLeft: 66,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 13,
              fontWeight: '800',
            }}
          >
            {formatMinutes(card.durationSeconds)}
          </Text>
          <LiquidButton
            accessibilityHint={card.accessibilityHint}
            accessibilityLabel={card.accessibilityLabel}
            label={card.ctaLabel}
            onPress={onPress}
            rightIcon={
              <Icon
                color={
                  isPrimary
                    ? vexLightGlass.text.inverse
                    : vexLightGlass.mint[600]
                }
                name="arrowRight"
                size="sm"
                variant="solid"
              />
            }
            size={isPrimary ? 'md' : 'sm'}
            variant={isPrimary ? 'primary' : 'outline'}
          />
        </View>
      </GlassCard>
    </View>
  );
}

export default FocusModeCardView;
