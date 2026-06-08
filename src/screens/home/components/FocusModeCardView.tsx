import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons';
import type { FocusModeCard } from '../../../features/session-start/schemas';

export type ModeColor = 'mint' | 'cyan' | 'teal' | 'coral';

export interface ModeVisual {
  color: ModeColor;
  iconName: string;
  iconColor: string;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function getIconForMode(mode: string): React.ReactNode {
  switch (mode) {
    case 'sprint-15':
      return <Icon color="#0C765F" name="bolt" size="md" strokeWidth="thin" variant="outline" />;
    case 'light-focus':
      return <Icon color="#0C765F" name="leaf" size="md" strokeWidth="thin" variant="outline" />;
    case 'study':
      return <Icon color="#0E7490" name="book" size="md" strokeWidth="thin" variant="outline" />;
    case 'recovery':
      return <Icon color="#C2410C" name="heart" size="md" strokeWidth="thin" variant="outline" />;
    default:
      return <Icon color="#0C765F" name="target" size="md" strokeWidth="thin" variant="outline" />;
  }
}

function getColorForMode(mode: string): ModeColor {
  switch (mode) {
    case 'sprint-15': return 'mint';
    case 'light-focus': return 'teal';
    case 'study': return 'cyan';
    case 'recovery': return 'coral';
    default: return 'mint';
  }
}

interface FocusModeCardViewProps {
  card: FocusModeCard;
  visual: ModeVisual;
  onPress: () => void;
}

export function FocusModeCardView({
  card,
  onPress,
}: FocusModeCardViewProps): JSX.Element {
  const isPrimary = card.id === 'sprint-15';
  const color = getColorForMode(card.id);
  const icon = getIconForMode(card.id);

  return (
    <View style={{ marginBottom: 10 }}>
      <GlassCard
        glowMint={isPrimary}
        padding={16}
        radius={24}
        variant={isPrimary ? 'premium' : 'default'}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            gap: 14,
            zIndex: 2,
          }}
        >
          <LiquidGlassSphere
            color={color}
            icon={icon}
            size={56}
            intensity={0.85}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                color: '#0A1F1A',
                fontSize: 16,
                fontWeight: '800',
                letterSpacing: -0.3,
                lineHeight: 22,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                color: '#3D5A52',
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
            marginTop: 12,
            paddingLeft: 70,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              color: '#0A1F1A',
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
                color={isPrimary ? '#FFFFFF' : '#0A9B8A'}
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
