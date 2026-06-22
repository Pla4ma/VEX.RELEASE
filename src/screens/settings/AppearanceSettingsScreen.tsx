import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, type ThemeMode } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import type { SettingsStackParams } from '../../navigation';
import { ThemePicker } from './ThemePicker';
import { FontSizeControl, type FontSize } from './FontSizeControl';
import {
  ColorSchemeToggle,
  type AccentColor,
  type TimerFormat,
} from './ColorSchemeToggle';
import { AppearancePreviewCard } from './AppearancePreviewCard';
import {
  LiquidGlassHeader,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';

type Props = NativeStackScreenProps<SettingsStackParams, 'AppearanceSettings'>;

const AppearanceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(mode);
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [timerFormat, setTimerFormat] = useState<TimerFormat>('countdown');

  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      setSelectedTheme(newTheme);
      setMode(newTheme);
    },
    [setMode],
  );

  const handleAccentColorChange = useCallback((color: AccentColor) => {
    setAccentColor(color);
  }, []);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSize(size);
  }, []);

  const handleTimerFormatChange = useCallback((format: TimerFormat) => {
    setTimerFormat(format);
  }, []);

  const getFontSizeMultiplier = (): number => {
    switch (fontSize) {
      case 'small':
        return 0.875;
      case 'large':
        return 1.125;
      default:
        return 1;
    }
  };

  return (
    <LiquidGlassScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={liquidGlassSpacing.screenX}
          pb={16}
          pt={insets.top + liquidGlassSpacing.screenTop}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Appearance setting"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <LiquidGlassHeader
            eyebrow="Glass lab"
            title="Appearance"
            body="Keep the record bright, quiet, and readable."
          />
        </Box>

        <AppearancePreviewCard
          theme={theme}
          accentColor={accentColor}
          timerFormat={timerFormat}
          fontSizeMultiplier={getFontSizeMultiplier()}
        />

        <ThemePicker
          selectedTheme={selectedTheme}
          onThemeChange={handleThemeChange}
        />

        <ColorSchemeToggle
          accentColor={accentColor}
          onAccentColorChange={handleAccentColorChange}
          timerFormat={timerFormat}
          onTimerFormatChange={handleTimerFormatChange}
        />

        <FontSizeControl
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
        />

        <Box px={16} mb={24}>
          <Pressable
            onPress={() => {
              setSelectedTheme('dark');
              setMode('dark');
              setAccentColor('indigo');
              setFontSize('medium');
              setTimerFormat('countdown');
            }}
            style={{
              backgroundColor: theme.colors.background.secondary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
            accessibilityLabel="Reset appearance to defaults"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Text
              style={{
                color: theme.colors.text.primary,
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Reset to Defaults
            </Text>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </LiquidGlassScreen>
  );
};

const AppearanceSettingsScreenWithBoundary = withScreenErrorBoundary(AppearanceSettingsScreen, "AppearanceSettings");
export { AppearanceSettingsScreenWithBoundary as AppearanceSettingsScreen };
