import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "../../../../components/primitives/Text";
import { useTheme } from "../../../../theme";
import type { FocusScoreDashboardModel } from "../../types";

interface FactorMapProps {
  model: FocusScoreDashboardModel;
}

export function FactorMap({ model }: FactorMapProps): JSX.Element | null {
  const { theme } = useTheme();
  const strongestWeakest = useMemo(() => {
    if (!model.current) {
      return null;
    }
    const entries = [
      ["Consistency", model.current.factors.consistency.score],
      ["Streak stability", model.current.factors.streakStability.score],
      ["Session quality", model.current.factors.sessionQuality.score],
      [
        "Intentional difficulty",
        model.current.factors.intentionalDifficulty.score,
      ],
      ["Recency", model.current.factors.recency.score],
    ] as const;
    const strongest = [...entries].sort((a, b) => b[1] - a[1])[0];
    const weakest = [...entries].sort((a, b) => a[1] - b[1])[0];
    return { strongest, weakest, entries };
  }, [model]);

  if (!strongestWeakest) return null;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        gap: theme.spacing[2],
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      <Text variant="h4" color={theme.colors.text.primary}>
        Factor map
      </Text>
      {strongestWeakest.entries.map(([label, score]) => (
        <View key={label} style={{ gap: theme.spacing[1] }}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {label}: {score}
          </Text>
          <View
            style={{
              height: theme.spacing[2],
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.background.tertiary,
            }}
          >
            <View
              style={{
                height: theme.spacing[2],
                width: `${score}%`,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.primary[500],
              }}
            />
          </View>
        </View>
      ))}
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        Strongest pattern: {strongestWeakest.strongest?.[0] ?? "—"}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        Weakest pattern: {strongestWeakest.weakest?.[0] ?? "—"}
      </Text>
    </View>
  );
}
