import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../../../components/primitives/Text';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { VexIcon } from './VexIcon';

interface VexHeaderProps {
  eyebrow: string;
  title: string;
  body: string;
  onNotifications?: () => void;
}

export function VexHeader({
  eyebrow,
  title,
  body,
  onNotifications,
}: VexHeaderProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
          <View
            style={{
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
              height: 9,
              width: 9,
            }}
          />
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.heading.h3.fontSize,
              fontWeight: theme.fontWeights.heavy,
              letterSpacing: 1.2,
            }}
          >
            VEX
          </Text>
        </View>
        {onNotifications ? (
          <Pressable
            accessibilityHint="Shows your VEX notifications"
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            onPress={onNotifications}
            style={({ pressed }) => ({
              alignItems: 'center',
              borderColor: theme.colors.border.DEFAULT,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              justifyContent: 'center',
              opacity: pressed ? 0.72 : 1,
              ...getMinTouchTargetStyle(),
            })}
          >
            <VexIcon color={theme.colors.primary[500]} name="alarm" size="md" variant="outline" />
          </Pressable>
        ) : null}
      </View>
      <Text
        style={{
          color: theme.colors.primary[500],
          fontSize: theme.typography.ui.label.fontSize,
          fontWeight: theme.fontWeights.bold,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </Text>
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.heading.h1.fontSize,
          fontWeight: theme.fontWeights.heavy,
          letterSpacing: -0.5,
          lineHeight: theme.typography.heading.h1.lineHeight,
        }}
      >
        {title}
      </Text>
      <Text color="text.secondary" variant="bodyLarge">
        {body}
      </Text>
    </View>
  );
}
