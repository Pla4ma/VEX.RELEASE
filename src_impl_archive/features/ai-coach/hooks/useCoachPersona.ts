/**
 * useCoachPersona Hook
 *
 * Persona selection and management hooks.
 */

import { useQuery } from '@tanstack/react-query';
import * as repository from '../repository';
import * as service from '../service';
import { useCoachStore } from '../store';

const coachKeys = {
  all: ['coach'] as const,
  personas: () => [...coachKeys.all, 'personas'] as const,
  persona: (id: string) => [...coachKeys.all, 'persona', id] as const,
};

export function useCoachPersonas() {
  return useQuery({
    queryKey: coachKeys.personas(),
    queryFn: service.getCoachPersonas,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useCoachPersona(personaId: string) {
  return useQuery({
    queryKey: coachKeys.persona(personaId),
    queryFn: () => repository.fetchCoachPersona(personaId),
    enabled: Boolean(personaId),
    staleTime: 60 * 60 * 1000,
  });
}

export function useCoachUIState() {
  return useCoachStore((state) => ({
    activeMessage: state.activeMessage,
    showHistory: state.showHistory,
    selectedPersona: state.selectedPersona,
    mutedCategories: state.mutedCategories,
    reduceNotifications: state.reduceNotifications,
  }));
}

export function useCoachUIActions() {
  return useCoachStore((state) => ({
    setActiveMessage: state.setActiveMessage,
    dismissMessage: state.dismissMessage,
    toggleHistory: state.toggleHistory,
    selectPersona: state.selectPersona,
    muteCategory: state.muteCategory,
    unmuteCategory: state.unmuteCategory,
    setReduceNotifications: state.setReduceNotifications,
    closeModal: state.closeModal,
  }));
}

export function useHasDismissedMessage(messageId: string) {
  return useCoachStore((state) => state.dismissedMessages.includes(messageId));
}
