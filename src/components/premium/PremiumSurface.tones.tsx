import React from 'react';
import { View } from 'react-native';

import { GlassCard } from '../glass/GlassCard';
import { LiquidButton } from '../glass/LiquidButton';
import { Icon } from '../../icons/components/Icon';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { buttonTap } from '../../utils/haptics';

export type SurfaceTone = 'default' | 'celebration' | 'info' | 'warning' | 'locked';

export interface ToneRenderProps {
  actionLabel?: string;
  body?: string;
  children?: React.ReactNode;
  eyebrow?: string;
  icon?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  title?: string;
}

export interface SurfaceVariantProps extends ToneRenderProps {
  style?: import('react-native').ViewStyle;
}

export function InfoSurface({
  actionLabel,
  body,
  children,
  eyebrow,
  icon,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  style,
  title,
}: SurfaceVariantProps): React.ReactNode {
  return (
    <GlassCard variant="subtle" style={style}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        {icon ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(132, 228, 229, 0.16)',
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <Icon name={icon} size={18} color={vexLightGlass.mint[500]} />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 6 }}>
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
              variant="body"
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 22,
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
          {children}
          {(actionLabel || secondaryActionLabel) ? (
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
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
      </View>
    </GlassCard>
  );
}

export function WarningSurface({
  actionLabel,
  body,
  children,
  icon,
  onAction,
  style,
  title,
}: SurfaceVariantProps): React.ReactNode {
  return (
    <GlassCard variant="subtle" style={style}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        {icon ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(223, 164, 74, 0.16)',
            }}
          >
            <Icon name={icon} size={16} color={vexLightGlass.semantic.warning} />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          {title ? (
            <Text
              variant="body"
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '700',
                lineHeight: 20,
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
