import React from "react";
import { Box, Skeleton, Stack } from "@components/primitives";
import { useReducedMotion } from "../../../hooks";

export function ReportSkeleton(): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const animate = !isReducedMotion;

  return (
    <Stack gap="md" padding="md" testID="report-skeleton">
      <Box>
        <Skeleton width={180} height={24} animated={animate} />
        <Skeleton width={100} height={40} animated={animate} />
        <Skeleton width={140} height={16} animated={animate} />
      </Box>

      <Box flexDirection="row" gap="md">
        <Box flex={1}>
          <Skeleton width="100%" height={80} animated={animate} />
        </Box>
        <Box flex={1}>
          <Skeleton width="100%" height={80} animated={animate} />
        </Box>
      </Box>

      <Box>
        <Skeleton width="100%" height={120} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={160} height={20} animated={animate} />
        <Skeleton width="100%" height={48} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={160} height={20} animated={animate} />
        <Skeleton width="100%" height={48} animated={animate} />
      </Box>

      <Box>
        <Skeleton width="100%" height={100} animated={animate} />
      </Box>
    </Stack>
  );
}
