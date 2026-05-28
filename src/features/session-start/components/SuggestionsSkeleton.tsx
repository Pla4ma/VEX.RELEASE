import React from "react";

import { Box } from "../../../components/primitives/Box";
import { useTheme } from "../../../theme";

/**
 * Skeleton loading state for suggestions
 */
export function SuggestionsSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box gap="sm">
      {[1, 2].map((i) => (
        <Box
          key={i}
          flexDirection="row"
          alignItems="center"
          gap="md"
          p="md"
          borderRadius="xl"
          bg={theme.colors.background.tertiary}
        >
          <Box
            width={44}
            height={44}
            borderRadius="lg"
            bg={theme.colors.background.secondary}
          />
          <Box flex={1} gap="xs">
            <Box
              width="60%"
              height={16}
              borderRadius="sm"
              bg={theme.colors.background.secondary}
            />
            <Box
              width="80%"
              height={12}
              borderRadius="sm"
              bg={theme.colors.background.secondary}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
