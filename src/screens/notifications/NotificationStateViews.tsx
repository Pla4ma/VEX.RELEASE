import React from "react";
import { Box, Text } from "../../components/primitives";
import { Skeleton, SkeletonList } from "../../shared/ui/primitives";
import { ErrorState } from "../../components/states";
import { FILTER_LABELS } from "./NotificationScreenConfig";

export function NotificationLoadingState({
  insetsTop,
  backgroundColor,
}: {
  insetsTop: number;
  backgroundColor: string;
}): JSX.Element {
  return (
    <Box flex={1} style={{ backgroundColor }}>
      <Box px={20} pb={12} pt={insetsTop + 16}>
        <Box mb={16}>
          <Skeleton width={150} height={28} variant="text" />
        </Box>
        <Box flexDirection="row" gap={8}>
          <Skeleton width={50} height={28} variant="rounded" />
          <Skeleton width={80} height={28} variant="rounded" />
          <Skeleton width={70} height={28} variant="rounded" />
          <Skeleton width={60} height={28} variant="rounded" />
        </Box>
      </Box>
      <Box px={16} pt={12}>
        <SkeletonList count={6} />
      </Box>
    </Box>
  );
}

export function NotificationErrorState({
  insetsTop,
  backgroundColor,
  message,
  onRetry,
}: {
  insetsTop: number;
  backgroundColor: string;
  message: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <Box flex={1} style={{ backgroundColor }}>
      <Box px={20} pb={12} pt={insetsTop + 16}>
        <Text variant="h1">Notifications</Text>
      </Box>
      <ErrorState
        title="Failed to load notifications"
        description={message}
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    </Box>
  );
}

export function NotificationEmptyState({
  backgroundColor,
  headerElement,
}: {
  backgroundColor: string;
  headerElement: JSX.Element;
}): JSX.Element {
  return (
    <Box flex={1} style={{ backgroundColor }}>
      {headerElement}
      <Box flex={1} alignItems="center" justifyContent="center" px={24}>
        <Text fontSize={48}>{"\u{1F514}"}</Text>
        <Text variant="h4" mt={4}>
          No notifications yet
        </Text>
        <Text variant="body" color="text.secondary" mt={2} textAlign="center">
          You'll hear when something happens. Check back later for achievements,
          streak alerts, and more.
        </Text>
      </Box>
    </Box>
  );
}

export function NotificationFilteredEmptyState({
  backgroundColor,
  headerElement,
  activeFilter,
}: {
  backgroundColor: string;
  headerElement: JSX.Element;
  activeFilter: string;
}): JSX.Element {
  return (
    <Box flex={1} style={{ backgroundColor }}>
      {headerElement}
      <Box flex={1} alignItems="center" justifyContent="center" px={24}>
        <Text fontSize={48} color="text.tertiary">
          {"\u{2315}"}
        </Text>
        <Text variant="h4" style={{ marginTop: 16, textAlign: "center" }}>
          No{" "}
          {activeFilter === "all"
            ? ""
            : ` ${FILTER_LABELS[activeFilter] ?? activeFilter}`}{" "}
          notifications
        </Text>
        <Text
          variant="body"
          color="text.secondary"
          style={{ marginTop: 8, textAlign: "center" }}
        >
          Try selecting a different filter
        </Text>
      </Box>
    </Box>
  );
}
