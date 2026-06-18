import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { RealisticModeOrb } from '../../../components/glass/RealisticModeOrb';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons/components/Icon';
import type { FocusModeCard } from '../../../features/session-start/schemas';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

        
function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function getOrbMode(mode: string): 'sprint' | 'light' | 'study' | 'recovery' {
  if (mode.startsWith('light-focus')) {
    return 'light';
  }
  if (mode.startsWith('study')) {
    return 'study';
  }
  if (mode.startsWith('recovery')) {
    return 'recovery';
  }
  return 'sprint';
}

interface FocusModeCardViewProps {
  card: FocusModeCard;
  onPress: () => void;
}

export function FocusModeCardView({
  card,
  onPress,
}: FocusModeCardViewProps): React.ReactNode {
  const isPrimary = card.id === 'sprint-15';
  const orbMode = getOrbMode(card.id);

  return (
    <View style={{ marginBottom: 8 }}>
      <GlassCard
        glowMint={isPrimary}
        padding={16}
        radius={22}
        variant={isPrimary ? 'premium' : 'default'}
      >
        {isPrimary ? (
          <View
            pointerEvents="none"
            style={{
              opacity: 0.34,
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 0,
            }}
          >
            <VexAssetImage name="orangePrism" opacity={0.72} size={38} />
          </View>
        ) : null}
        <View
          pointerEvents="none"
          style={{}}
        />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            gap: 12,
            zIndex: 2,
          }}
        >
          <RealisticModeOrb
            mode={orbMode}
            size={isPrimary ? 66 : 58}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: 0,
                lineHeight: 20,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                lineHeight: 16,
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
            variant={isPrimary ? 'fire' : 'outline'}
          />
        </View>
      </GlassCard>
    </View>
  );
}

export default FocusModeCardView;
