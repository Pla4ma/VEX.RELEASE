import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import { useCallback } from 'react';

import type { SessionStackParams } from '../../../navigation/types';
import type { HomeHighlight } from '../../../store/session-state';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

interface ReturnPlan {
  highlightMessage: string;
  highlightTitle: string;
  highlightTone: HomeHighlight['tone'];
}

interface ActionsInput {
  navigation: SessionNavigationProp;
  reflection: string;
  selectedMood: string | null;
  returnPlan: ReturnPlan;
  showHomeHighlight: (highlight: HomeHighlight) => void;
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
        category: 'session',
        data: skipped
          ? undefined
          : {
              mood: selectedMood ?? 'SKIPPED',
              reflectionLength: reflection.trim().length,
            },
        level: 'info',
        message: skipped
          ? 'Session completion notes skipped'
          : 'Session completion notes submitted',
      });
      syncHomeReturn().catch(() => undefined);
      showHomeHighlight({
        message: returnPlan.highlightMessage,
        title: returnPlan.highlightTitle,
        tone: returnPlan.highlightTone,
      });
      navigation.navigate({ name: 'Main', params: {} });
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
