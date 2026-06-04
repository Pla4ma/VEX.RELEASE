import React from 'react';
import { Pressable } from 'react-native';
import { useTheme, type ThemeMode } from '@/theme';
import { Box, Text, Card } from '@/components/primitives';
import { Icon } from '@/icons';
import { lightColors } from '@/theme/tokens/colors';


interface ThemeOption {
  id: ThemeMode;
  label: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'system', label: 'System', icon: 'monitor' },
];

interface ThemePickerProps {
  selectedTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  const { theme } = useTheme();

  return (
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
        THEME
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        {THEME_OPTIONS.map((option, index) => (
          <React.Fragment key={option.id}>
            <Pressable
              onPress={() => onThemeChange(option.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              accessibilityLabel={`${option.label} theme`}
              accessibilityRole="button"
              accessibilityHint={`Switch to ${option.label.toLowerCase()} theme`}
            >
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor:
                    selectedTheme === option.id
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                }}
              >
                <Icon
                  name={option.icon}
                  size={20}
                  color={
                    selectedTheme === option.id
                      ? theme.colors.primary[500]
                      : theme.colors.text.tertiary
                  }
                />
              </Box>
              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: selectedTheme === option.id ? '600' : '500',
                    color: theme.colors.text.primary,
                  }}
                >
                  {option.label}
                </Text>
              </Box>
              {selectedTheme === option.id && (
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
            {index < THEME_OPTIONS.length - 1 && (
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
  );
};
