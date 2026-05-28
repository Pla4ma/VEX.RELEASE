import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import { useCallback } from "react";

import type { SessionStackParams } from "../../../navigation/types";

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

interface ReturnPlan {
  highlightMessage: string;
  highlightTitle: string;
  highlightTone: string;
}

interface ActionsInput {
  navigation: SessionNavigationProp;
  reflection: string;
  selectedMood: string | null;
  returnPlan: ReturnPlan;
  showHomeHighlight: (input: {
    message: string;
    title: string;
    tone: string;
  }) => void;
  syncHomeReturn: () => Promise<unknown>;
}

export function useSessionCompleteActions(input: ActionsInput) {
  const {
    navigation,
    reflection,
    selectedMood,
    returnPlan,
    showHomeHighlight,
    syncHomeReturn,
  } = input;

  const finishSession = useCallback(
    (skipped: boolean) => {
      Sentry.addBreadcrumb({
        category: "session",
        data: skipped
          ? undefined
          : {
              mood: selectedMood ?? "SKIPPED",
              reflectionLength: reflection.trim().length,
            },
        level: "info",
        message: skipped
          ? "Session completion notes skipped"
          : "Session completion notes submitted",
      });
      syncHomeReturn().catch(() => undefined);
      showHomeHighlight({
        message: returnPlan.highlightMessage,
        title: returnPlan.highlightTitle,
        tone: returnPlan.highlightTone,
      });
      navigation.navigate({ name: "Main", params: {} });
    },
    [
      navigation,
      reflection,
      returnPlan,
      selectedMood,
      showHomeHighlight,
      syncHomeReturn,
    ],
  );

  return { finishSession };
}
