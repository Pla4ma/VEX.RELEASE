import type { CompanionMemory } from '../memory-types';

export type CompanionMemoryGroup = {
  data: CompanionMemory[];
  title: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
};

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayDelta(now: Date, value: string): number {
  const memoryDate = new Date(value);
  const deltaMs = startOfDay(now) - startOfDay(memoryDate);
  return Math.floor(deltaMs / 86_400_000);
}

function titleFor(now: Date, memory: CompanionMemory): CompanionMemoryGroup['title'] {
  const delta = dayDelta(now, memory.createdAt);
  if (delta === 0) {
    return 'Today';
  }
  if (delta === 1) {
    return 'Yesterday';
  }
  if (delta >= 0 && delta < 7) {
    return 'This Week';
  }
  return 'Earlier';
}

export function groupCompanionMemories(
  memories: CompanionMemory[],
  now: Date = new Date(),
): CompanionMemoryGroup[] {
  const groups = new Map<CompanionMemoryGroup['title'], CompanionMemory[]>();

  memories.forEach((memory) => {
    const title = titleFor(now, memory);
    groups.set(title, [...(groups.get(title) ?? []), memory]);
  });

  return (['Today', 'Yesterday', 'This Week', 'Earlier'] as const)
    .map((title) => ({ data: groups.get(title) ?? [], title }))
    .filter((group) => group.data.length > 0);
}
