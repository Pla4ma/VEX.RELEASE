/**
 * useSmartSchedule Hook
 *
 * React Query hook for AI-powered scheduling.
 * Integrates calendar data with study patterns and preferences.
 *
 * @phase 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getSmartSchedulerService } from '../service';
import { getCalendarService } from '../service';
import { getUserService } from '../users';
import type {
  ScheduleSuggestion,
  CalendarEvent,
  StudyPattern,
  SchedulePreferences,
  TimeSlot,
} from '../types';

const debug = createDebugger('calendar:useSmartSchedule');

// ============================================================================
// Query Keys
// ============================================================================

const smartScheduleKeys = {
  all: ['smartSchedule'] as const,
  suggestions: (date?: Date) => [...smartScheduleKeys.all, 'suggestions', date?.toDateString()] as const,
  patterns: () => [...smartScheduleKeys.all, 'patterns'] as const,
  preferences: () => [...smartScheduleKeys.all, 'preferences'] as const,
  availability: (date?: Date) => [...smartScheduleKeys.all, 'availability', date?.toDateString()] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useSmartSchedule(date?: Date) {
  const queryClient = useQueryClient();
  const schedulerService = getSmartSchedulerService();
  const calendarService = getCalendarService();
  const userService = getUserService();

  // ============================================================================
  // Queries
  // ============================================================================

  const suggestionsQuery = useQuery({
    queryKey: smartScheduleKeys.suggestions(date),
    queryFn: () => schedulerService.getScheduleSuggestions(date),
    refetchInterval: 300000, // 5 minutes
    enabled: !!date,
  });

  const patternsQuery = useQuery({
    queryKey: smartScheduleKeys.patterns(),
    queryFn: () => schedulerService.getStudyPatterns(),
    refetchInterval: 600000, // 10 minutes
  });

  const preferencesQuery = useQuery({
    queryKey: smartScheduleKeys.preferences(),
    queryFn: () => schedulerService.getSchedulePreferences(),
    refetchInterval: 300000, // 5 minutes
  });

  const availabilityQuery = useQuery({
    queryKey: smartScheduleKeys.availability(date),
    queryFn: () => schedulerService.getAvailableTimeSlots(date),
    refetchInterval: 300000, // 5 minutes
    enabled: !!date,
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: Partial<SchedulePreferences>) =>
      schedulerService.updateSchedulePreferences(preferences),
    onSuccess: () => {
      debug.info('Schedule preferences updated');
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.suggestions(date) });
    },
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: (params: {
      suggestionId: string;
      startTime: Date;
      endTime: Date;
      title?: string;
      description?: string;
    }) => schedulerService.scheduleStudySession(params),
    onSuccess: () => {
      debug.info('Study session scheduled');
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.suggestions(date) });
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.availability(date) });
    },
  });

  const dismissSuggestionMutation = useMutation({
    mutationFn: (params: { suggestionId: string; reason?: string }) =>
      schedulerService.dismissSuggestion(params.suggestionId, params.reason),
    onSuccess: () => {
      debug.info('Suggestion dismissed');
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.suggestions(date) });
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const updatePreferences = useCallback((preferences: Partial<SchedulePreferences>) => {
    updatePreferencesMutation.mutate(preferences);
  }, [updatePreferencesMutation]);

  const scheduleSession = useCallback((
    suggestionId: string,
    startTime: Date,
    endTime: Date,
    title?: string,
    description?: string
  ) => {
    scheduleSessionMutation.mutate({
      suggestionId,
      startTime,
      endTime,
      title,
      description,
    });
  }, [scheduleSessionMutation]);

  const dismissSuggestion = useCallback((suggestionId: string, reason?: string) => {
    dismissSuggestionMutation.mutate({ suggestionId, reason });
  }, [dismissSuggestionMutation]);

  const refreshSuggestions = useCallback(() => {
    suggestionsQuery.refetch();
    availabilityQuery.refetch();
  }, [suggestionsQuery, availabilityQuery]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const suggestions = suggestionsQuery.data || [];
  const patterns = patternsQuery.data || [];
  const preferences = preferencesQuery.data;
  const availability = availabilityQuery.data || [];

  const hasSuggestions = suggestions.length > 0;
  const hasHighConfidenceSuggestions = suggestions.some(s => s.confidence >= 90);
  const isOptimalTime = availability.some(slot => slot.isOptimal);

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error = suggestionsQuery.error || 
                patternsQuery.error || 
                preferencesQuery.error || 
                availabilityQuery.error || null;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    suggestions,
    patterns,
    preferences,
    availability,

    // State
    hasSuggestions,
    hasHighConfidenceSuggestions,
    isOptimalTime,

    // Loading states
    isLoading: suggestionsQuery.isLoading || 
               patternsQuery.isLoading || 
               preferencesQuery.isLoading || 
               availabilityQuery.isLoading,
    isFetching: suggestionsQuery.isFetching || 
                 patternsQuery.isFetching || 
                 preferencesQuery.isFetching || 
                 availabilityQuery.isFetching,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isScheduling: scheduleSessionMutation.isPending,
    isDismissing: dismissSuggestionMutation.isPending,

    // Error states
    error,
    isError: !!error,

    // Actions
    updatePreferences,
    scheduleSession,
    dismissSuggestion,
    refreshSuggestions,

    // Raw queries for advanced use
    queries: {
      suggestions: suggestionsQuery,
      patterns: patternsQuery,
      preferences: preferencesQuery,
      availability: availabilityQuery,
    },
  };
}

// ============================================================================
// Helper Hook: Weekly Schedule
// ============================================================================

export function useWeeklySchedule() {
  const schedulerService = getSmartSchedulerService();
  
  const weeklyQuery = useQuery({
    queryKey: [...smartScheduleKeys.all, 'weekly'],
    queryFn: () => schedulerService.getWeeklySchedule(),
    refetchInterval: 600000, // 10 minutes
  });

  return {
    weeklySchedule: weeklyQuery.data,
    isLoading: weeklyQuery.isLoading,
    error: weeklyQuery.error,
    refetch: weeklyQuery.refetch,
  };
}

// ============================================================================
// Helper Hook: Calendar Integration
// ============================================================================

export function useCalendarIntegration() {
  const queryClient = useQueryClient();
  const calendarService = getCalendarService();

  const syncCalendarsMutation = useMutation({
    mutationFn: () => calendarService.syncCalendars(),
    onSuccess: () => {
      debug.info('Calendars synced');
      queryClient.invalidateQueries({ queryKey: smartScheduleKeys.all });
    },
  });

  const calendarEventsQuery = useQuery({
    queryKey: [...smartScheduleKeys.all, 'calendarEvents'],
    queryFn: () => calendarService.getUpcomingEvents(7), // Next 7 days
    refetchInterval: 600000, // 10 minutes
  });

  const syncCalendars = useCallback(() => {
    syncCalendarsMutation.mutate();
  }, [syncCalendarsMutation]);

  return {
    calendarEvents: calendarEventsQuery.data || [],
    isSyncing: syncCalendarsMutation.isPending,
    isLoading: calendarEventsQuery.isLoading,
    error: calendarEvents.error || syncCalendarsMutation.error,
    syncCalendars,
    refetch: calendarEventsQuery.refetch,
  };
}

// ============================================================================
// Helper Hook: Schedule Analytics
// ============================================================================

export function useScheduleAnalytics() {
  const schedulerService = getSmartSchedulerService();
  
  const analyticsQuery = useQuery({
    queryKey: [...smartScheduleKeys.all, 'analytics'],
    queryFn: () => schedulerService.getScheduleAnalytics(),
    refetchInterval: 3600000, // 1 hour
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
}
