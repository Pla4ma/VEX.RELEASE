import React from "react";
import { View } from "react-native";

import { Button } from "../../../components/primitives/Button";
import { spacing } from "../../../theme/tokens/spacing";

export type HistoryFilter = "all" | "completed" | "unfinished";

const FILTERS: HistoryFilter[] = ["all", "completed", "unfinished"];

export function HistoryFilterTabs({
  filter,
  onChange,
}: {
  filter: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
}): JSX.Element {
  return (
    <View style={{ flexDirection: "row", gap: spacing[2] }}>
      {FILTERS.map((item) => (
        <Button
          key={item}
          accessibilityHint={`Shows ${item} session records`}
          accessibilityLabel={`Show ${item} sessions`}
          accessibilityRole="button"
          onPress={() => onChange(item)}
          size="sm"
          variant={filter === item ? "primary" : "ghost"}
        >
          {item}
        </Button>
      ))}
    </View>
  );
}
