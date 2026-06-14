import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from './service';
import * as repository from './repository';
import type { PlanItem, PlanProject, PlanStudyPlan, PlanItemStatus } from './types';

export function usePlanItems(userId: string | null) {
  return useQuery({
    queryKey: ['plan', 'items', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as PlanItem[]);
      return repository.fetchPlanItems(userId);
    },
    enabled: !!userId,
  });
}

export function useTodayItems(userId: string | null) {
  return useQuery({
    queryKey: ['plan', 'today', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as PlanItem[]);
      return service.getTodayItems(userId);
    },
    enabled: !!userId,
  });
}

export function useWeekItems(userId: string | null) {
  return useQuery({
    queryKey: ['plan', 'week', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as PlanItem[]);
      return service.getWeekItems(userId);
    },
    enabled: !!userId,
  });
}

export function useProjects(userId: string | null) {
  return useQuery({
    queryKey: ['plan', 'projects', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as PlanProject[]);
      return repository.fetchProjects(userId);
    },
    enabled: !!userId,
  });
}

export function useStudyPlans(userId: string | null) {
  return useQuery({
    queryKey: ['plan', 'studyPlans', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([] as PlanStudyPlan[]);
      return repository.fetchStudyPlans(userId);
    },
    enabled: !!userId,
  });
}

export function useAddPlanItem(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      projectId?: string | null;
      studyPlanId?: string | null;
      dueDate?: string | null;
      estimatedMinutes?: number | null;
      tags?: string[];
      lane?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.addItem(userId, input.title, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', 'items', userId] });
      queryClient.invalidateQueries({ queryKey: ['plan', 'today', userId] });
      queryClient.invalidateQueries({ queryKey: ['plan', 'week', userId] });
    },
  });
}

export function useUpdatePlanItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; status: PlanItemStatus }) =>
      repository.updatePlanItemStatus(input.itemId, input.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] });
    },
  });
}

export function useDeletePlanItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => repository.deletePlanItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] });
    },
  });
}

export function useAddProject(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      lane?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.addProject(userId, input.name, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', 'projects', userId] });
    },
  });
}

export function useAddStudyPlan(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      subject: string;
      description?: string;
      targetDate?: string | null;
      lane?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.addStudyPlan(userId, input.name, input.subject, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', 'studyPlans', userId] });
    },
  });
}
