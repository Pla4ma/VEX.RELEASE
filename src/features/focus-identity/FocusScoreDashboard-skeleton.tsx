import React from "react";
import { Box, Text, Stack, Skeleton } from "@components/primitives";
import { useReducedMotion } from "../../hooks";

export const FocusScoreDashboardSkeleton = () => {
  const { isReducedMotion } = useReducedMotion();
  const animate = !isReducedMotion;

  return (
    <Stack gap="md" testID="focus-score-dashboard-skeleton">
      <Box>
        <Skeleton width={100} height={20} animated={animate} />
        <Skeleton width={80} height={30} animated={animate} />
        <Skeleton width={120} height={16} animated={animate} />
      </Box>

      <Box>
        <Skeleton width="100%" height={150} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={120} height={20} animated={animate} />
        <Skeleton width="100%" height={16} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={120} height={20} animated={animate} />
        <Skeleton
          width="100%"
          height={40}
          variant="rounded"
          animated={animate}
        />
      </Box>
    </Stack>
  );
};
