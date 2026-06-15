import React from 'react';

import { Box, Text } from '../../../components/primitives/Box';
import type { Theme } from '../../../theme/types';

type SessionReturnReasonCardProps = {
  body: string;
  theme: Theme;
  title: string;
};

export function SessionReturnReasonCard({
  body,
  theme,
  title,
}: SessionReturnReasonCardProps) {
  return (
    <Box
      mt={5}
      p={5}
      borderRadius="xl"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        borderWidth: 1,
      }}
    >
      <Text variant="label" color={theme.colors.primary[400]}>
        Return Reason
      </Text>
      <Text variant="h4" color={theme.colors.text.primary} mt={2}>
        {title}
      </Text>
      <Text variant="body" color={theme.colors.text.secondary} mt={2}>
        {body}
      </Text>
    </Box>
  );
}
