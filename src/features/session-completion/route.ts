import { useMemo } from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { SessionStackParams } from '../../navigation/types';
import {
  SessionCompletionNavigationParamsSchema,
  type SessionCompletionNavigationParams,
} from './schemas';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
type SessionCompleteRouteProp = RouteProp<
  SessionStackParams,
  'SessionComplete'
>;

function parseSessionCompletionParams(params: unknown): {
  params: SessionCompletionNavigationParams | null;
  recoverySessionId: string | null;
  warningMessage: string | null;
} {
  const parsed = SessionCompletionNavigationParamsSchema.safeParse(params);
  return {
    params: parsed.success ? parsed.data : null,
    recoverySessionId: null,
    warningMessage: parsed.success ? null : 'Session summary is unavailable.',
  };
}

export function useSessionCompletionRouteState() {
  const navigation = useNavigation<SessionNavigationProp>();
  const route = useRoute<SessionCompleteRouteProp>();
  const parsedRoute = useMemo(
    () => parseSessionCompletionParams(route.params),
    [route.params],
  );

  return { navigation, parsedRoute };
}
