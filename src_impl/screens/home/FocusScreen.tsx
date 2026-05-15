import React, { useMemo } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppScreen, Button, Card, Text } from "../../components/primitives";
import { useStreakSummary } from "../../features/streaks/hooks";
import type { ExtendedRootStackParams } from "../../navigation/types";
import { useAuthStore } from "../../store";
import { useTheme } from "../../theme";

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function FocusScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const streakQuery = useStreakSummary(userId || null);

  const streakText = useMemo(() => {
    if (streakQuery.isLoading) {
      return "Loading your streak…";
    }

    const streakDays = streakQuery.data?.currentDays ?? 0;
    if (streakDays <= 0) {
      return "Start today: one clean session builds tomorrow's momentum.";
    }

    return `${streakDays} day streak active. Keep it alive with one focused block.`;
  }, [streakQuery.data?.currentDays, streakQuery.isLoading]);

  const openSession = (durationSeconds?: number): void => {
    navigation.navigate("SessionStack", {
      screen: "SessionSetup",
      params: durationSeconds ? { presetDuration: durationSeconds } : {},
    });
  };

  return (
    <AppScreen contentStyle={{ gap: theme.spacing[4] }}>
      <View style={{ gap: theme.spacing[1], marginBottom: theme.spacing[2] }}>
        <Text color="primary.300" variant="label">
          Focus launcher
        </Text>
        <Text color="text.primary" variant="h1">
          Start a focus session
        </Text>
        <Text color="text.secondary" variant="body">
          Pick a duration and begin. Nothing extra.
        </Text>
      </View>

      <Card size="lg" variant="premium">
        <Text color="text.primary" variant="h3">
          Start Session
        </Text>
        <Text color="text.secondary" mb="md" mt="xs" variant="bodySmall">
          Launch your next focus block with your current defaults.
        </Text>
        <Button
          fullWidth
          onPress={() => openSession()}
          size="lg"
          variant="primary"
          accessibilityLabel="Start focus session"
          accessibilityRole="button"
          accessibilityHint="Opens session setup"
        >
          Start session
        </Button>
      </Card>

      <Card size="lg" variant="default">
        <Text color="text.primary" variant="h3">
          Quick durations
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginTop: theme.spacing[4],
          }}
        >
          <Button
            onPress={() => openSession(25 * 60)}
            size="sm"
            variant="outline"
          >
            25 min
          </Button>
          <Button
            onPress={() => openSession(45 * 60)}
            size="sm"
            variant="outline"
          >
            45 min
          </Button>
          <Button
            onPress={() => openSession(60 * 60)}
            size="sm"
            variant="outline"
          >
            60 min
          </Button>
        </View>
      </Card>

      <Text color="text.secondary" variant="bodySmall">
        {streakText}
      </Text>
    </AppScreen>
  );
}

export default FocusScreen;
