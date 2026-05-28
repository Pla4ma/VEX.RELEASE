import React from "react";
import { Box, Text, Card } from "../../components/primitives";
import { Icon } from "../../icons";
import { launchColors } from "@theme/tokens/launch-colors";
import type { AccentColor, TimerFormat } from "./ColorSchemeToggle";
import { ACCENT_COLORS, TIMER_FORMAT_OPTIONS } from "./ColorSchemeToggle";
import type { Theme } from "../../theme";

type AppearancePreviewCardProps = {
  theme: Theme;
  accentColor: AccentColor;
  timerFormat: TimerFormat;
  fontSizeMultiplier: number;
};

export function AppearancePreviewCard({
  theme,
  accentColor,
  timerFormat,
  fontSizeMultiplier,
}: AppearancePreviewCardProps): JSX.Element {
  return (
    <Box px={16} mb={24}>
      <Text
        variant="caption"
        color="text.secondary"
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        PREVIEW
      </Text>
      <Card
        size="md"
        style={{
          backgroundColor: theme.colors.background.secondary,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 32,
        }}
      >
        <Box
          width={60}
          height={60}
          borderRadius={30}
          justifyContent="center"
          alignItems="center"
          mb={16}
          style={{
            backgroundColor:
              ACCENT_COLORS.find((c) => c.id === accentColor)?.hex ||
              theme.colors.primary[500],
          }}
        >
          <Icon name="timer" size={28} color={launchColors.hex_fff} />
        </Box>
        <Text
          variant="h3"
          style={{
            fontSize: 36 * fontSizeMultiplier,
            fontWeight: "700",
            color: theme.colors.text.primary,
          }}
        >
          {TIMER_FORMAT_OPTIONS.find((f) => f.id === timerFormat)
            ?.preview || "24:59"}
        </Text>
        <Text
          variant="body"
          color="text.secondary"
          style={{ marginTop: 8, fontSize: 16 * fontSizeMultiplier }}
        >
          Focus Session
        </Text>
      </Card>
    </Box>
  );
}
