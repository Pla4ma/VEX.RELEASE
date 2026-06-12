import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { GlassCard } from '../glass/GlassCard';
import { LiquidButton } from '../glass/LiquidButton';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { buttonTap } from '../../utils/haptics';

type SurfaceTone = 'default' | 'celebration' | 'info' | 'warning' | 'locked';

interface PremiumSurfaceProps {
  children?: React.ReactNode;
  title?: string;
  body?: string;
  eyebrow?: string;
  icon?: string;
  tone?: SurfaceTone;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export function PremiumSurface({
  children,
  title,
  body,
  eyebrow,
  icon,
  tone = 'default',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: PremiumSurfaceProps): JSX.Element {
  const cardVariant = tone === 'celebration' ? 'default' : 'subtle';
  const isWarning = tone === 'warning';

  return (
    <GlassCard variant={cardVariant} style={style}>
      <View style={{ gap: 12 }}>
        {eyebrow || title || body ? (
          <View style={{ gap: 4 }}>
            {eyebrow ? (
              <Text
                variant="label"
                style={{
                  color: isWarning ? vexLightGlass.semantic.danger : vexLightGlass.mint[500],
                  fontSize: 13,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {icon ? `${icon} ${eyebrow}` : eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text
                variant="h4"
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 20,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                  lineHeight: 28,
                }}
              >
                {title}
              </Text>
            ) : null}
            {body ? (
              <Text
                variant="bodySmall"
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 14,
                  fontWeight: '400',
                  letterSpacing: 0,
                  lineHeight: 20,
                }}
              >
                {body}
              </Text>
            ) : null}
          </View>
        ) : null}

        {children}

        {actionLabel && onAction ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <LiquidButton
              label={actionLabel}
              onPress={() => {
                buttonTap();
                onAction();
              }}
              accessibilityLabel={actionLabel ?? 'Perform action'}
              accessibilityHint="Performs the primary action for this section"
              size="sm"
            />
            {secondaryActionLabel && onSecondaryAction ? (
              <LiquidButton
                label={secondaryActionLabel}
                variant="secondary"
                onPress={() => {
                  buttonTap();
                  onSecondaryAction();
                }}
                accessibilityLabel={secondaryActionLabel ?? 'Perform secondary action'}
                accessibilityHint="Performs the secondary action for this section"
                size="sm"
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

export { SectionHeader, InlineStatusRow } from './premium-surface-extras';
