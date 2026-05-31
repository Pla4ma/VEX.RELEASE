/**
 * Skeleton placeholder for the Live Focusing Widget.
 * Renders compact or full-size variant.
 */
import React from 'react';
import { Box } from '../../../../components/primitives/Box';

interface LiveFocusingSkeletonProps {
  compact?: boolean;
}

export function LiveFocusingSkeleton({
  compact = false,
}: LiveFocusingSkeletonProps): JSX.Element {
  if (compact) {
    return (
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
      >
        <Box
          width={8}
          height={8}
          borderRadius="full"
          bg="background.tertiary"
        />
        <Box flex={1} gap="xs">
          <Box
            width={150}
            height={16}
            borderRadius="sm"
            bg="background.tertiary"
          />
          <Box
            width={100}
            height={12}
            borderRadius="sm"
            bg="background.tertiary"
          />
        </Box>
        <Box flexDirection="row">
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              width={32}
              height={32}
              borderRadius="full"
              bg="background.tertiary"
              style={{ marginLeft: i === 1 ? 0 : -8 }}
            />
          ))}
        </Box>
      </Box>
    );
  }
  return (
    <Box
      p="xl"
      borderRadius="xl"
      bg="background.secondary"
      borderWidth={1}
      borderColor="border.light"
      gap="lg"
    >
      <Box flexDirection="row" justifyContent="space-between">
        <Box
          width={80}
          height={16}
          borderRadius="sm"
          bg="background.tertiary"
        />
        <Box
          width={60}
          height={16}
          borderRadius="sm"
          bg="background.tertiary"
        />
      </Box>

      <Box alignItems="center" gap="sm">
        <Box flexDirection="row" gap="sm">
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              width={40}
              height={40}
              borderRadius="full"
              bg="background.tertiary"
            />
          ))}
        </Box>
        <Box
          width={120}
          height={48}
          borderRadius="sm"
          bg="background.tertiary"
        />
        <Box
          width={200}
          height={24}
          borderRadius="sm"
          bg="background.tertiary"
        />
        <Box
          width={180}
          height={16}
          borderRadius="sm"
          bg="background.tertiary"
        />
      </Box>

      <Box
        flexDirection="row"
        justifyContent="space-between"
        p="md"
        borderRadius="lg"
        bg="background.tertiary"
      >
        {[1, 2, 3].map((i) => (
          <Box key={i} alignItems="center" gap="xs">
            <Box
              width={30}
              height={24}
              borderRadius="sm"
              bg="background.secondary"
            />
            <Box
              width={50}
              height={12}
              borderRadius="sm"
              bg="background.secondary"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
