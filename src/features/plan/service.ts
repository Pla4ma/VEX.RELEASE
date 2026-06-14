import * as repository from './repository';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { PlanItem, PlanItemStatus, PlanItemPriority, PlanProject, PlanStudyPlan } from './types';

export async function getTodayItems(userId: string): Promise<PlanItem[]> {
  const items = await repository.fetchPlanItems(userId);
  const today = new Date().toISOString().split('T')[0]!;
  return items.filter(
    (item) =>
      item.status !== 'done' &&
      (item.dueDate?.startsWith(today) ?? true),
  );
}

export async function getWeekItems(userId: string): Promise<PlanItem[]> {
  const items = await repository.fetchPlanItems(userId);
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return items.filter((item) => {
    if (item.dueDate) {
      const d = new Date(item.dueDate);
      return d >= weekStart && d < weekEnd;
    }
    return true;
  });
}

export async function addItem(
  userId: string,
  title: string,
  options?: {
    description?: string;
    priority?: PlanItemPriority;
    projectId?: string | null;
    studyPlanId?: string | null;
    dueDate?: string | null;
    estimatedMinutes?: number | null;
    tags?: string[];
    lane?: string;
  },
): Promise<PlanItem> {
  return repository.createPlanItem({
    userId,
    title,
    status: 'todo',
    priority: options?.priority ?? 'medium',
    description: options?.description,
    projectId: options?.projectId ?? null,
    studyPlanId: options?.studyPlanId ?? null,
    dueDate: options?.dueDate ?? null,
    estimatedMinutes: options?.estimatedMinutes ?? null,
    tags: options?.tags ?? [],
    lane: options?.lane,
  });
}

export async function completeItem(itemId: string): Promise<PlanItem> {
  return repository.updatePlanItemStatus(itemId, 'done', new Date().toISOString());
}

export async function startItem(itemId: string): Promise<PlanItem> {
  return repository.updatePlanItemStatus(itemId, 'in_progress', null);
}

export async function archiveItem(itemId: string): Promise<void> {
  return repository.deletePlanItem(itemId);
}

export async function addProject(
  userId: string,
  name: string,
  options?: {
    description?: string;
    color?: string;
    icon?: string;
    lane?: string;
  },
): Promise<PlanProject> {
  return repository.createProject({
    userId,
    name,
    description: options?.description,
    color: options?.color,
    icon: options?.icon,
    status: 'active',
    lane: options?.lane,
  });
}

export async function addStudyPlan(
  userId: string,
  name: string,
  subject: string,
  options?: {
    description?: string;
    targetDate?: string | null;
    lane?: string;
  },
): Promise<PlanStudyPlan> {
  return repository.createStudyPlan({
    userId,
    name,
    subject,
    description: options?.description,
    status: 'active',
    targetDate: options?.targetDate ?? null,
    lane: options?.lane,
  });
}

export function calculateProjectProgress(items: PlanItem[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter((i) => i.status === 'done').length;
  return Math.round((completed / items.length) * 100);
}

export function getPriorityColor(priority: PlanItemPriority): string {
  switch (priority) {
    case 'urgent':
      return vexLightGlass.semantic.danger;
    case 'high':
      return vexLightGlass.semantic.warning;
    case 'medium':
      return vexLightGlass.semantic.info;
    case 'low':
      return vexLightGlass.text.tertiary;
    default:
      return vexLightGlass.text.tertiary;
  }
}

export function getStatusLabel(status: PlanItemStatus): string {
  switch (status) {
    case 'todo':
      return 'To do';
    case 'in_progress':
      return 'In progress';
    case 'done':
      return 'Done';
    case 'blocked':
      return 'Blocked';
    default:
      return 'To do';
  }
}
