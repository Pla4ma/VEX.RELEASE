import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useState, useCallback } from "react";
import { ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme, type ThemeMode } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { Icon } from "../../icons";
import type { SettingsStackParams } from "../../navigation";
import { ThemePicker } from "./ThemePicker";
import { FontSizeControl, type FontSize } from "./FontSizeControl";
import {
  ColorSchemeToggle,
  type AccentColor,
  type TimerFormat,
} from "./ColorSchemeToggle";
import { AppearancePreviewCard } from "./AppearancePreviewCard";

type Props = NativeStackScreenProps<SettingsStackParams, "AppearanceSettings">;

export const AppearanceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(mode);
  const [accentColor, setAccentColor] = useState<AccentColor>("indigo");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [timerFormat, setTimerFormat] = useState<TimerFormat>("countdown");

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
      case "small":
        return 0.875;
      case "large":
        return 1.125;
      default:
        return 1;
    }
  };

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={20}
          pb={16}
          pt={insets.top + 16}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <Text variant="h2">Appearance</Text>
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
              setSelectedTheme("dark");
              setMode("dark");
              setAccentColor("indigo");
              setFontSize("medium");
              setTimerFormat("countdown");
            }}
            style={{
              backgroundColor: theme.colors.background.secondary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
            accessibilityLabel="Reset to Defaults button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text
              style={{
                color: theme.colors.text.primary,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Reset to Defaults
            </Text>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(
  AppearanceSettingsScreen,
  "AppearanceSettings",
);
