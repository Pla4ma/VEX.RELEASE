import React from 'react';
import { View } from 'react-native';

import { GlassCard } from '../glass/GlassCard';
import { LiquidButton } from '../glass/LiquidButton';
import { Icon } from '../../icons/components/Icon';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { buttonTap } from '../../utils/haptics';
import type { SurfaceVariantProps } from './PremiumSurface.tones';

export function LockedSurface({
  actionLabel,
  body,
  children,
  eyebrow,
  icon,
  onAction,
  style,
  title,
}: SurfaceVariantProps): React.ReactNode {
  return (
    <GlassCard variant="subtle" style={style}>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
        {icon ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(16, 35, 31, 0.06)',
            }}
          >
            <Icon name={icon} size={28} color={vexLightGlass.text.tertiary} />
          </View>
        ) : null}
        {eyebrow ? (
          <Text
            variant="label"
            style={{
              color: vexLightGlass.text.tertiary,
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
              fontSize: 18,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -0.2,
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
              lineHeight: 20,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            {body}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <LiquidButton
            label={actionLabel}
            onPress={() => {
              buttonTap();
              onAction();
            }}
            accessibilityLabel={actionLabel ?? 'Perform action'}
            accessibilityHint="Performs the primary action for this section"
            size="md"
          />
        ) : null}
        {children}
      </View>
    </GlassCard>
  );
}

export function CelebrationSurface({
  actionLabel,
  body,
  children,
  icon,
  onAction,
  style,
  title,
}: SurfaceVariantProps): React.ReactNode {
  return (
    <GlassCard variant="default" style={style}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        {icon ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(24, 184, 148, 0.12)',
            }}
          >
            <Icon name={icon} size={20} color={vexLightGlass.mint[600]} />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          {title ? (
            <Text
              variant="body"
              style={{ color: vexLightGlass.text.primary, fontSize: 16, fontWeight: '700' }}
            >
              {title}
            </Text>
          ) : null}
          {body ? (
            <Text
              variant="bodySmall"
              style={{ color: vexLightGlass.text.secondary, fontSize: 13, lineHeight: 18 }}
            >
              {body}
            </Text>
          ) : null}
        </View>
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
      </View>
      {children}
    </GlassCard>
  );
}
