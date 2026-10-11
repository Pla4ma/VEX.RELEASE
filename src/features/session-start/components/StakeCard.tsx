import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { SessionStake } from './SessionStakesBriefing.types';
import {
  SessionGlyph,
  type SessionGlyphName,
} from '../../../shared/ui/liquid-glass/SessionGlyphs';
import { vexFire } from '../../../theme/tokens/vex-fire';

interface StakeCardProps {
  icon: SessionGlyphName;
  title: string;
  subtitle: string;
  urgency: SessionStake['urgency'];
  accentColor?: string;
  onPress?: () => void;
}

      
export function StakeCard({
  icon,
  title,
  subtitle,
  urgency,
  accentColor,
  onPress,
}: StakeCardProps): React.ReactNode {
  const { theme } = useTheme();

  
  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'critical':
        return {
          borderColor: vexFire.danger,
          bgColor: `${vexFire.danger}15`,
          iconBg: vexFire.danger,
        };
      case 'high':
        return {
          borderColor: vexFire.amber,
          bgColor: `${vexFire.amber}10`,
          iconBg: vexFire.amber,
        };
      case 'medium':
        return {
          borderColor: accentColor || vexFire.ember,
          bgColor: `${accentColor || vexFire.ember}10`,
          iconBg: accentColor || vexFire.ember,
        };
      default:
        return {
          borderColor: vexFire.border,
          bgColor: vexFire.panelSoft,
          iconBg: vexFire.textMuted,
        };
    }
  };
  const styles = getUrgencyStyles();
  const CardWrapper = onPress ? Pressable : View;
  return (
    <CardWrapper
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? `View details for ${title}` : undefined}
    >
      <View
        style={{
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing[3],
  padding: theme.spacing[3],
  backgroundColor: styles.bgColor,
  borderRadius: theme.borderRadius.lg,
  borderWidth: 1,
  borderColor: styles.borderColor,
}}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.borderRadius['2xl'],
            backgroundColor: vexFire.backgroundRaised,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SessionGlyph name={icon} size={36} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" fontWeight="600" color={vexFire.cream}>
            {title}
          </Text>
          <Text variant="caption" color={vexFire.textSecondary}>
            {subtitle}
          </Text>
        </View>
      </View>
    </CardWrapper>
  );
}
