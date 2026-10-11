import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';


import type { AccentColor, TimerFormat } from './ColorSchemeToggle';
import { ACCENT_COLORS, TIMER_FORMAT_OPTIONS } from './ColorSchemeToggle';
import type { Theme } from '../../theme';

type AppearancePreviewCardProps = {
  theme: Theme;
  accentColor: AccentColor;
  timerFormat: TimerFormat;
  fontSizeMultiplier: number;
};

export function AppearancePreviewCard({
  theme: _theme,
  accentColor,
  timerFormat,
  fontSizeMultiplier,
}: AppearancePreviewCardProps): React.ReactNode {
  return (
    <Box px={16} mb={24}>
      <Text
        variant="caption"
        color={vexFire.textSecondary}
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: '600',
          letterSpacing: 0.5,
        }}
      >
        PREVIEW
      </Text>
      <Card
        size="md"
        style={{
          backgroundColor: vexFire.panel,
          alignItems: 'center',
          justifyContent: 'center',
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
              vexFire.ember,
          }}
        >
          <VexIcon name="timer" size="lg" color={vexFire.cream} variant="solid" />
        </Box>
        <Text
          variant="h3"
          style={{
            fontSize: 36 * fontSizeMultiplier,
            fontWeight: '700',
            color: vexFire.cream,
          }}
        >
          {TIMER_FORMAT_OPTIONS.find((f) => f.id === timerFormat)
            ?.preview || '24:59'}
        </Text>
        <Text
          variant="body"
          color={vexFire.textSecondary}
          style={{ marginTop: 8, fontSize: 16 * fontSizeMultiplier }}
        >
          Focus Session
        </Text>
      </Card>
    </Box>
  );
}
