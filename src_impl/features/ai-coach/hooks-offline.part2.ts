import { useEffect, useCallback, useRef, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { MMKV } from "react-native-mmkv";
import { useQueryClient } from "@tanstack/react-query";
import * as service from "./service";
import * as repository from "./repository";
import { type CoachMessage, type CoachState } from "./schemas";
import { COACH_QUERY_KEYS } from "./hooks-enhanced";
import { createDebugger } from "../../utils/debug";


export function useOfflinePersonaSelection(userId: string) {
  const { queueMutation, isProcessing } = useOfflineCoach(userId);
  const queryClient = useQueryClient();

  const selectPersona = useCallback(
    async (personaId: string) => {
      // Optimistic update
      queryClient.setQueryData(
        COACH_QUERY_KEYS.state(userId),
        (old: CoachState | undefined) => {
          if (!old) {
            return old;
          }
          return { ...old, personaId };
        },
      );

      queueMutation({
        type: "SELECT_PERSONA",
        payload: { userId, personaId },
      });
    },
    [userId, queueMutation, queryClient],
  );

  return { selectPersona, isProcessing };
}