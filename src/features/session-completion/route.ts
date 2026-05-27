import { useMemo } from "react";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { SessionStackParams } from "../../navigation/types";
import { parseSessionCompletionParams } from "./service";

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
type SessionCompleteRouteProp = RouteProp<
  SessionStackParams,
  "SessionComplete"
>;

export function useSessionCompletionRouteState() {
  const navigation = useNavigation<SessionNavigationProp>();
  const route = useRoute<SessionCompleteRouteProp>();
  const parsedRoute = useMemo(
    () => parseSessionCompletionParams(route.params),
    [route.params],
  );

  return { navigation, parsedRoute };
}
