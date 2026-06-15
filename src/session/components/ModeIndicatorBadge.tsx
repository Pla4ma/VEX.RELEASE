import React from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { SessionMode } from '../modes';

const MODE_LABELS: Record<SessionMode, string> = {
  [SessionMode.DEEP_WORK]: 'DEEP WORK',
  [SessionMode.CHALLENGE]: 'CHALLENGE',
  [SessionMode.LIGHT_FOCUS]: 'LIGHT FOCUS',
  [SessionMode.FLOW]: 'FLOW',
  [SessionMode.STUDY]: 'STUDY',
  [SessionMode.CREATIVE]: 'CREATIVE',
  [SessionMode.SPRINT]: 'SPRINT',
  [SessionMode.RECOVERY]: 'RECOVERY',
  [SessionMode.STARTER]: 'STARTER',
  [SessionMode.PLAN]: 'PLAN',
  [SessionMode.REVIEW]: 'REVIEW',
  [SessionMode.CAPTURE]: 'CAPTURE',
  [SessionMode.HABIT]: 'HABIT',
};

type ModeIndicatorBadgeProps = {
  chainCount?: number;
  mode: SessionMode;
};

export function ModeIndicatorBadge({
  chainCount,
  mode,
}: ModeIndicatorBadgeProps): React.ReactNode {
  const suffix =
    mode === SessionMode.SPRINT && chainCount ? ` ${chainCount}/4` : '';

  return (
    <Box
      position="absolute"
      top={54}
      left={16}
      minHeight={44}
      px="md"
      borderRadius="full"
      bg="background.elevated"
      alignItems="center"
      justifyContent="center"
      style={{ zIndex: 20 }}
    >
      <Text variant="caption" color="text.primary">
        {`${MODE_LABELS[mode]}${suffix}`}
      </Text>
    </Box>
  );
}
