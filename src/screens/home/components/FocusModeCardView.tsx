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
      <GlassCard variant={isPrimary ? 'selected' : 'default'} padding={14} radius={18}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            gap: 12,
          }}
        >
            <GlassIconOrb size={56} variant={visual.orb}>
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
                  fontSize: 16,
                  fontWeight: '800',
                  letterSpacing: -0.3,
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
            paddingLeft: 68,
          }}
        >
          <GlassPill
            label={formatMinutes(card.durationSeconds)}
            size="sm"
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
