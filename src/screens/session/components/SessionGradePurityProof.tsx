import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import {
  getPremiumCardStyle,
  withAlpha,
} from '../../../components/premiumStyles';
import { useTheme } from '../../../theme/ThemeContext';
import { glow } from '../../../theme/tokens/elevation';

interface SessionGradePurityProofProps {
  clampedPurity: number;
  purityColor: string;
  purityLabel: string;
  durationLabel: string;
  gradeColor: string;
}

export function SessionGradePurityProof({
  clampedPurity,
  purityColor,
  purityLabel,
  durationLabel,
  gradeColor,
}: SessionGradePurityProofProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(380).springify()}>
      <Box
        mt={24}
        px={24}
        py={20}
        alignItems="center"
        style={{
          backgroundColor: withAlpha(vexFire.panel, 0.92),
          borderWidth: 1,
          borderColor: withAlpha(gradeColor, 0.34),
          ...getPremiumCardStyle('hero'),
          ...glow(gradeColor, 'whisper'),
        }}
      >
        <Text variant="h3" color={vexFire.cream}>
          {clampedPurity}% purity
        </Text>
        <Text variant="body" color={purityColor} mt={8}>
          {purityLabel}
        </Text>
        <Text variant="caption" color={vexFire.textSecondary} mt={14}>
          {durationLabel}
        </Text>
      </Box>
    </Animated.View>
  );
}
