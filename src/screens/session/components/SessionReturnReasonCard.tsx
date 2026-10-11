import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';

import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import type { Theme } from '../../../theme/types';

type SessionReturnReasonCardProps = {
  body: string;
  theme: Theme;
  title: string;
};

export function SessionReturnReasonCard({
  body,
  theme: _theme,
  title,
}: SessionReturnReasonCardProps) {
  return (
    <Box
      mt={5}
      p={5}
      borderRadius="xl"
      style={{
        backgroundColor: vexFire.panel,
        borderColor: vexFire.border,
        borderWidth: 1,
      }}
    >
      <Text variant="label" color={vexFire.ember}>
        Return Reason
      </Text>
      <Text variant="h4" color={vexFire.cream} mt={2}>
        {title}
      </Text>
      <Text variant="body" color={vexFire.textSecondary} mt={2}>
        {body}
      </Text>
    </Box>
  );
}
