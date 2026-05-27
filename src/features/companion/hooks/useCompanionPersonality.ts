/**
 * useCompanionPersonality Hook
 *
 * React hook for accessing companion personality responses.
 * Subscribes to the CompanionPersonalityEngine and provides
 * the current response state to React components.
 */

import { useEffect, useState, useCallback } from "react";
import {
  getCompanionPersonalityEngine,
  CompanionPersonalityState,
  PersonalityEventType,
} from "../CompanionPersonalityEngine";

interface UseCompanionPersonalityReturn extends CompanionPersonalityState {
  clearResponse: () => void;
  hasActiveResponse: boolean;
}

export function useCompanionPersonality(): UseCompanionPersonalityReturn {
  const [state, setState] = useState<CompanionPersonalityState>(() =>
    getCompanionPersonalityEngine().getState(),
  );

  useEffect(() => {
    const engine = getCompanionPersonalityEngine();
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const clearResponse = useCallback(() => {
    getCompanionPersonalityEngine().clearCurrentResponse();
  }, []);

  return {
    ...state,
    clearResponse,
    hasActiveResponse: state.currentResponse !== null,
  };
}
