import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { GlassCard } from '../glass/GlassCard';
import { LiquidButton } from '../glass/LiquidButton';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { buttonTap } from '../../utils/haptics';
import {
  InfoSurface,
  WarningSurface,
  type SurfaceTone,
} from './PremiumSurface.tones';
import { CelebrationSurface, LockedSurface } from './PremiumSurface.toneLocked';

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

/**
 * PremiumSurface — tone-driven composition.
 *
 * Each tone renders through a dedicated variant surface so no two
 * PremiumSurface calls look the same. The 'default' tone is the
 * fallback stacked layout.
 */
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
}: PremiumSurfaceProps): React.ReactNode {
  if (tone === 'info') {
    return (
      <InfoSurface
        actionLabel={actionLabel}
        body={body}
        eyebrow={eyebrow}
        icon={icon}
        onAction={onAction}
        onSecondaryAction={onSecondaryAction}
        secondaryActionLabel={secondaryActionLabel}
        style={style}
        title={title}
      >
        {children}
      </InfoSurface>
    );
  }

  if (tone === 'warning') {
    return (
      <WarningSurface
        actionLabel={actionLabel}
        body={body}
        icon={icon}
        onAction={onAction}
        style={style}
        title={title}
      >
        {children}
      </WarningSurface>
    );
  }

  if (tone === 'locked') {
    return (
      <LockedSurface
        actionLabel={actionLabel}
        body={body}
        eyebrow={eyebrow}
        icon={icon}
        onAction={onAction}
        style={style}
        title={title}
      >
        {children}
      </LockedSurface>
    );
  }

  if (tone === 'celebration') {
    return (
      <CelebrationSurface
        actionLabel={actionLabel}
        body={body}
        icon={icon}
        onAction={onAction}
        style={style}
        title={title}
      >
        {children}
      </CelebrationSurface>
    );
  }

  return (
    <GlassCard variant="subtle" style={style}>
      <View style={{ gap: 12 }}>
        {(eyebrow || title || body) ? (
          <View style={{ gap: 6 }}>
            {eyebrow ? (
              <Text
                variant="label"
                style={{
                  color: vexLightGlass.mint[700],
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text
                variant="h4"
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 20,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                  lineHeight: 26,
                }}
              >
                {title}
              </Text>
            ) : null}
            {body ? (
              <Text
                variant="bodySmall"
                style={{ color: vexLightGlass.text.secondary, fontSize: 14, lineHeight: 20 }}
              >
                {body}
              </Text>
            ) : null}
          </View>
        ) : null}

        {children}

        {(actionLabel || secondaryActionLabel) ? (
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {actionLabel && onAction ? (
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
            ) : null}
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
