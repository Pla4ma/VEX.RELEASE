import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { FocusModeCard } from '../../../features/session-start/schemas';

export type ModeOrb = 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';

export interface ModeVisual {
  orb: ModeOrb;
  icon: string;
  iconColor: string;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

interface FocusModeCardViewProps {
  card: FocusModeCard;
  visual: ModeVisual;
  onPress: () => void;
}

export function FocusModeCardView({
  card,
  visual,
  onPress,
}: FocusModeCardViewProps): JSX.Element {
  const isPrimary = card.id === 'sprint-15';
  return (
    <View style={{ marginBottom: 12 }}>
      <GlassCard
        glowMint={isPrimary}
        padding={16}
        radius={26}
        variant={isPrimary ? 'premium' : 'default'}
      >
        {isPrimary ? (
          <>
            <View
              pointerEvents="none"
              style={{
                backgroundColor: 'rgba(95, 230, 197, 0.22)',
                borderRadius: 280,
                height: 200,
                position: 'absolute',
                right: -60,
                top: -60,
                width: 200,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                backgroundColor: 'rgba(132, 228, 229, 0.18)',
                borderRadius: 180,
                height: 110,
                position: 'absolute',
                right: 30,
                top: 20,
                width: 110,
              }}
            />
          </>
        ) : null}

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            gap: 14,
            zIndex: 2,
          }}
        >
          <GlassIconOrb size={60} variant={visual.orb}>
            <Icon
              color={visual.iconColor}
              name={visual.icon}
              size="md"
              variant="solid"
            />
          </GlassIconOrb>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 18,
                fontWeight: '800',
                letterSpacing: -0.3,
                lineHeight: 23,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                lineHeight: 17,
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
            marginTop: 14,
            paddingLeft: 74,
            zIndex: 2,
          }}
        >
          <GlassPill
            label={formatMinutes(card.durationSeconds)}
            size="md"
            variant="neutral"
          />
          <LiquidButton
            accessibilityHint={card.accessibilityHint}
            accessibilityLabel={card.accessibilityLabel}
            label={card.ctaLabel}
            onPress={onPress}
            rightIcon={
              <Icon
                color={isPrimary ? '#FFFFFF' : '#0C765F'}
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
