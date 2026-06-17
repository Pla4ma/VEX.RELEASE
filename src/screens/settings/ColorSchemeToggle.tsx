import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Box, Text, Card } from '@/components/primitives';
import { Icon } from '@/icons';
import { lightColors } from '@/theme/tokens/colors';

import {
  ACCENT_COLORS,
  TIMER_FORMAT_OPTIONS,
  type AccentColor,
  type TimerFormat,
} from './color-scheme-constants';
export type { AccentColor, TimerFormat } from './color-scheme-constants';
export { ACCENT_COLORS, TIMER_FORMAT_OPTIONS } from './color-scheme-constants';

interface ColorSchemeToggleProps {
  accentColor: AccentColor;
  onAccentColorChange: (color: AccentColor) => void;
  timerFormat: TimerFormat;
  onTimerFormatChange: (format: TimerFormat) => void;
}

              
export const ColorSchemeToggle: React.FC<ColorSchemeToggleProps> = ({
  accentColor,
  onAccentColorChange,
  timerFormat,
  onTimerFormatChange,
}) => {
  const { theme } = useTheme();

  

  return (
    <>
      <Box px={16} mb={24}>
        <Text
          variant="caption"
          color="text.secondary"
          style={{
            marginLeft: 12,
            marginBottom: 8,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}
        >
          ACCENT COLOR
        </Text>
        <Card size="sm" style={{ padding: 16 }}>
          <Box
            flexDirection="row"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            {ACCENT_COLORS.map((color) => (
              <Pressable
                key={color.id}
                onPress={() => onAccentColorChange(color.id)}
                style={{
  width: 64,
  height: 64,
  borderRadius: 16,
  marginBottom: 12,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.hex,
  borderWidth: accentColor === color.id ? 3 : 0,
  borderColor: theme.colors.text.primary,
}}
                accessibilityLabel="Color scheme option"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                {accentColor === color.id && (
                  <Icon name="check" size={24} color={lightColors.text.inverse} />
                )}
              </Pressable>
            ))}
          </Box>
        </Card>
      </Box>

      <Box px={16} mb={24}>
        <Text
          variant="caption"
          color="text.secondary"
          style={{
            marginLeft: 12,
            marginBottom: 8,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}
        >
          TIMER DISPLAY
        </Text>
        <Card size="sm" style={{ overflow: 'hidden' }}>
          {TIMER_FORMAT_OPTIONS.map((option, index) => (
            <React.Fragment key={option.id}>
              <Pressable
                onPress={() => onTimerFormatChange(option.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
                accessibilityLabel="Color scheme option"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Box
                  width={40}
                  height={40}
                  borderRadius={10}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    backgroundColor:
                      timerFormat === option.id
                        ? theme.colors.primary[50]
                        : theme.colors.background.secondary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color:
                        timerFormat === option.id
                          ? theme.colors.primary[500]
                          : theme.colors.text.tertiary,
                    }}
                  >
                    {option.preview}
                  </Text>
                </Box>
                <Box flex={1} ml={12}>
                  <Text
                    variant="body"
                    style={{
                      fontWeight: timerFormat === option.id ? '600' : '500',
                      color: theme.colors.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>
                </Box>
                {timerFormat === option.id && (
                  <Box
                    width={24}
                    height={24}
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  >
                    <Icon
                      name="check"
                      size={14}
                      color={lightColors.text.inverse}
                    />
                  </Box>
                )}
              </Pressable>
              {index < TIMER_FORMAT_OPTIONS.length - 1 && (
                <Box
                  height={1}
                  ml={68}
                  style={{ backgroundColor: theme.colors.border.light }}
                />
              )}
            </React.Fragment>
          ))}
        </Card>
      </Box>
    </>
  );
};
