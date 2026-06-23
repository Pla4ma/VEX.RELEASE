import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError } from '../../lib/repository/error-handling';
import type { PlanItemStatus } from './schemas';
import { mapPlanItem, mapPlanProject, mapPlanStudyPlan } from './repository-mappers';
import type { PlanItem, PlanProject, PlanStudyPlan } from './types';
import { tableColumns } from '../../lib/repository/tableColumns';

export async function fetchPlanItems(userId: string): Promise<PlanItem[]> {
  const { data, error } = await getSupabaseClient()
    .from('plan_items')
    .select(tableColumns('plan_items'))
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new RepositoryError('fetchPlanItems', error);
  return (data ?? []).map(mapPlanItem);
}

export async function fetchPlanItemsByProject(
  userId: string,
  projectId: string,
): Promise<PlanItem[]> {
  const { data, error } = await getSupabaseClient()
    .from('plan_items')
    .select(tableColumns('plan_items'))
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new RepositoryError('fetchPlanItemsByProject', error);
  return (data ?? []).map(mapPlanItem);
}

export async function fetchPlanItemsByStudyPlan(
  userId: string,
  studyPlanId: string,
): Promise<PlanItem[]> {
  const { data, error } = await getSupabaseClient()
    .from('plan_items')
    .select(tableColumns('plan_items'))
    .eq('user_id', userId)
    .eq('study_plan_id', studyPlanId)
    .order('created_at', { ascending: false });

  if (error) throw new RepositoryError('fetchPlanItemsByStudyPlan', error);
  return (data ?? []).map(mapPlanItem);
}

export async function createPlanItem(
  input: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<PlanItem> {
  const { data, error } = await getSupabaseClient()
    .from('plan_items')
    .insert({
      user_id: input.userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      project_id: input.projectId,
      study_plan_id: input.studyPlanId,
      due_date: input.dueDate,
      estimated_minutes: input.estimatedMinutes,
      tags: input.tags,
      lane: input.lane,
    })
    .select(tableColumns('plan_items'))
    .single();

  if (error) throw new RepositoryError('createPlanItem', error);
  return mapPlanItem(data);
}

export async function updatePlanItemStatus(
  itemId: string,
  status: PlanItemStatus,
  completedAt?: string | null,
): Promise<PlanItem> {
  const { data, error } = await getSupabaseClient()
    .from('plan_items')
    .update({ status, completed_at: completedAt })
    .eq('id', itemId)
    .select(tableColumns('plan_items'))
    .single();

  if (error) throw new RepositoryError('updatePlanItemStatus', error);
  return mapPlanItem(data);
}

export async function deletePlanItem(itemId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('plan_items')
    .delete()
    .eq('id', itemId);

  if (error) throw new RepositoryError('deletePlanItem', error);
}

export async function fetchProjects(userId: string): Promise<PlanProject[]> {
  const { data, error } = await getSupabaseClient()
    .from('plan_projects')
    .select(tableColumns('plan_projects'))
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new RepositoryError('fetchProjects', error);
  return (data ?? []).map(mapPlanProject);
}

export async function createProject(
  input: Omit<PlanProject, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'itemCount' | 'completedItemCount'>,
): Promise<PlanProject> {
  const { data, error } = await getSupabaseClient()
    .from('plan_projects')
    .insert({
      user_id: input.userId,
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      status: input.status,
      lane: input.lane,
    })
    .select(tableColumns('plan_projects'))
    .single();

  if (error) throw new RepositoryError('createProject', error);
  return mapPlanProject(data);
}

export async function fetchStudyPlans(userId: string): Promise<PlanStudyPlan[]> {
  const { data, error } = await getSupabaseClient()
    .from('plan_study_plans')
    .select(tableColumns('plan_study_plans'))
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new RepositoryError('fetchStudyPlans', error);
  return (data ?? []).map(mapPlanStudyPlan);
}

export async function createStudyPlan(
  input: Omit<PlanStudyPlan, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'itemCount' | 'completedItemCount'>,
): Promise<PlanStudyPlan> {
  const { data, error } = await getSupabaseClient()
    .from('plan_study_plans')
    .insert({
      user_id: input.userId,
      name: input.name,
      subject: input.subject,
      description: input.description,
      status: input.status,
      target_date: input.targetDate,
      lane: input.lane,
    })
    .select(tableColumns('plan_study_plans'))
    .single();

  if (error) throw new RepositoryError('createStudyPlan', error);
  return mapPlanStudyPlan(data);
}
