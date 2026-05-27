import React, { useCallback, useMemo, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Box } from "../../components/primitives/Box";
import { FeatureScreen } from "../../components/primitives";
import { Text } from "../../components/primitives/Text";
import { ErrorState } from "../../components/states/ErrorState";
import {
  HistoryFilterTabs,
  type HistoryFilter,
} from "../../features/session-history/components/HistoryFilterTabs";
import { HistoryItem } from "../../features/session-history/components/HistoryItem";
import { HistoryStats } from "../../features/session-history/components/HistoryStats";
import {
  HistoryEmptyState,
  HistorySkeleton,
} from "../../features/session-history/components/HistoryStates";
import { useSessionHistoryRecords } from "../../features/session-history/hooks";
import type { SessionHistoryItem } from "../../features/session-history/types";
import type { SessionStackParams } from "../../navigation/types";
import { useNetInfo } from "../../network/useNetInfo";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { useAuthStore } from "../../store";
import { useTheme } from "../../theme";
import { sizing } from "../../theme/tokens/sizing";

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

function useFilteredHistory(
  items: SessionHistoryItem[],
  filter: HistoryFilter,
): SessionHistoryItem[] {
  return useMemo(() => {
    return items.filter((entry) => {
      if (filter === "completed") {
        return entry.status === "COMPLETED";
      }
      if (filter === "unfinished") {
        return entry.status !== "COMPLETED";
      }
      return true;
    });
  }, [filter, items]);
}

function SessionHistoryScreen(): JSX.Element {
  const navigation = useNavigation<SessionNavigationProp>();
  const { theme } = useTheme();
  const { isOffline } = useNetInfo();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const history = useSessionHistoryRecords(userId);
  const filteredHistory = useFilteredHistory(history.data.items, filter);

  const handleItemPress = useCallback(
    (entry: SessionHistoryItem) => {
      if (entry.summary) {
        navigation.navigate("SessionComplete", {
          sessionId: entry.sessionId,
          summary: entry.summary,
        });
      }
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SessionHistoryItem; index: number }) => (
      <HistoryItem entry={item} index={index} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  if (!userId) {
    return (
      <ErrorState
        title="Your focus record is locked"
        description="Sign in again and VEX will load the sessions tied to your account."
      />
    );
  }

  return (
    <FeatureScreen title="Session History" showBackButton>
      {isOffline && (
        <Box bg="warning.DEFAULT" p="sm">
          <Text variant="caption" color="text.inverse" textAlign="center">
            Offline. VEX will refresh your focus record when the connection
            returns.
          </Text>
        </Box>
      )}

      <Box p="lg" pb="sm">
        <HistoryFilterTabs filter={filter} onChange={setFilter} />
      </Box>

      <Box p="lg" pt="sm">
        <HistoryStats stats={history.data.stats} />
      </Box>

      {history.isPending ? <HistorySkeleton /> : null}

      {history.isError ? (
        <ErrorState
          title="VEX could not load your record yet"
          description="Your sessions are still yours. Retry in a moment and VEX will pull the latest history."
          retryLabel="Retry History"
          onRetry={history.refetch}
        />
      ) : null}

      {!history.isPending &&
      !history.isError &&
      filteredHistory.length === 0 ? (
        <HistoryEmptyState
          onStart={() =>
            navigation.navigate({ name: "SessionSetup", params: {} })
          }
        />
      ) : null}

      {!history.isPending && !history.isError && filteredHistory.length > 0 ? (
        <Box flex={1}>
          <FlashList
            contentContainerStyle={{ padding: theme.spacing[4] }}
            data={filteredHistory}
            estimatedItemSize={sizing.height["2xl"] + theme.spacing[6]}
            keyExtractor={(item: SessionHistoryItem) => item.sessionId}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </Box>
      ) : null}
    </FeatureScreen>
  );
}

export default withScreenErrorBoundary(SessionHistoryScreen, "SessionHistory");
