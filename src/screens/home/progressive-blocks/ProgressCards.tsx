import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export function ProgressPreviewCard({
  body,
  ctaLabel,
  eyebrow,
  onPress,
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <GlassCard variant="default" padding={16} radius={22}>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {body}
        </Text>
        <LiquidButton
          label={ctaLabel}
          onPress={onPress}
          variant="outline"
          accessibilityLabel="Perform action"
          accessibilityHint="Double tap to activate"
        />
      </View>
    </GlassCard>
  );
}

export function ReturnReasonCard({
  body,
  ctaLabel,
  eyebrow,
  onDismiss,
  onPress,
  tone = 'default',
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onDismiss?: () => void;
  onPress: () => void;
  tone?: 'default' | 'celebration' | 'info' | 'warning';
  title: string;
}) {
  const variant =
    tone === 'celebration'
      ? 'success'
      : tone === 'warning'
        ? 'warning'
        : 'default';

  return (
    <GlassCard variant={variant} padding={16} radius={22}>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: vexLightGlass.mint[700],
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {body}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <LiquidButton
            label={ctaLabel}
            onPress={onPress}
            variant="primary"
            accessibilityLabel="Perform action"
            accessibilityHint="Double tap to activate"
          />
          {onDismiss ? (
            <LiquidButton
              label="Dismiss"
              onPress={onDismiss}
              variant="ghost"
              accessibilityLabel="Dismiss progress card"
              accessibilityHint="Double tap to activate"
            />
          ) : null}
        </View>
      </View>
    </GlassCard>
  );
}
