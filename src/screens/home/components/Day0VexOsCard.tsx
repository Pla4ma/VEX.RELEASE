import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface Day0VexOsCardProps {
  completedActions: number;
  onStartSession: () => void;
}

export function Day0VexOsCard({
  completedActions,
  onStartSession,
}: Day0VexOsCardProps): React.ReactNode {
  const { theme } = useTheme();
  const ritualProgress = Math.min(5, Math.max(2, completedActions + 2));

  return (
    <View style={{ marginBottom: theme.spacing[6], paddingTop: theme.spacing[12], zIndex: 1 }}>
      <Text
        style={{
          color: theme.colors.text.tertiary,
          fontSize: theme.typography.ui.label.fontSize,
          fontWeight: theme.fontWeights.bold,
          letterSpacing: 3.2,
          marginBottom: theme.spacing[4],
          textTransform: 'uppercase',
        }}
      >
        Good evening
      </Text>
      <View style={{ backgroundColor: theme.colors.semantic.primary, height: 1, marginBottom: theme.spacing[5], width: theme.spacing[10] }} />
      <Text
        style={{
          color: theme.colors.text.primary,
          fontFamily: theme.fonts.display ?? theme.fonts.primary,
          fontSize: theme.typography.display.large.fontSize ?? theme.typography.heading.h2.fontSize ?? theme.spacing[6],
          fontWeight: theme.fontWeights.regular,
          letterSpacing: -0.6,
          lineHeight: theme.typography.display.large.lineHeight ?? theme.typography.heading.h2.lineHeight ?? theme.spacing[8],
          maxWidth: 340,
        }}
      >
        You don&apos;t need{`\n`}more time.{`\n`}
        <Text style={{ color: theme.colors.semantic.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.large.fontSize, fontStyle: 'italic', fontWeight: theme.fontWeights.regular, lineHeight: theme.typography.display.large.lineHeight }}>You need VEX.</Text>
      </Text>
      <Text color={theme.colors.text.tertiary} variant="bodyLarge" style={{ marginTop: theme.spacing[5], maxWidth: 300 }}>
        A focused ritual to quiet noise, protect attention, and move what matters forward.
      </Text>
      <View style={{ marginTop: theme.spacing[8] }}>
        <Text color={theme.colors.text.tertiary} variant="label" style={{ letterSpacing: 2.4 }}>Ritual progress</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing[1], marginTop: theme.spacing[3] }}>
          {Array.from({ length: 5 }, (_, index) => (
            <View
              key={`ritual-segment-${index}`}
              style={{ backgroundColor: index < ritualProgress ? theme.colors.semantic.primary : theme.colors.border.light, borderRadius: theme.borderRadius.full, height: theme.spacing[1], width: theme.spacing[8] }}
            />
          ))}
        </View>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[3], marginTop: theme.spacing[3] }}>
          <Text style={{ color: theme.colors.semantic.primary, fontSize: theme.typography.body.medium.fontSize, fontWeight: theme.fontWeights.bold }}>{ritualProgress} OF 5</Text>
          <Text color={theme.colors.text.tertiary} variant="label" style={{ letterSpacing: 1.8 }}>Focus sessions</Text>
        </View>
      </View>
      <Pressable
        accessibilityHint="Starts a focused work session"
        accessibilityLabel="Begin focus ritual"
        accessibilityRole="button"
        onPress={onStartSession}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed ? theme.colors.semantic.primaryPressed : theme.colors.semantic.primary,
          borderRadius: theme.borderRadius.md,
          justifyContent: 'center',
          marginTop: theme.spacing[8],
          minHeight: theme.spacing[16],
          ...getMinTouchTargetStyle(),
        })}
      >
        <Text style={{ color: theme.colors.semantic.liquidButtonText, fontSize: theme.typography.heading.h3.fontSize, fontWeight: theme.fontWeights.bold, letterSpacing: 4 }}>
          ||| ▶
        </Text>
      </Pressable>
    </View>
  );
}
