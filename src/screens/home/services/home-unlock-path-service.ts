import {
  HomeUnlockPathInputSchema,
  HomeUnlockPathModelSchema,
  type HomeUnlockPathInput,
  type HomeUnlockPathItem,
  type HomeUnlockPathModel,
} from './home-unlock-path-schemas';

function buildItem(
  input: HomeUnlockPathInput,
  item: Omit<HomeUnlockPathItem, 'current' | 'isUnlocked'>,
): HomeUnlockPathItem {
  const current = Math.min(input.completedSessions, item.requirement);
  return {
    ...item,
    current,
    isUnlocked: input.completedSessions >= item.requirement,
  };
}

export function buildHomeUnlockPathModel(
  rawInput: HomeUnlockPathInput,
): HomeUnlockPathModel {
  const input = HomeUnlockPathInputSchema.parse(rawInput);
  const items = [
    buildItem(input, {
      body: 'Your first finish gives VEX a baseline for the recap and next recommendation.',
      eyebrow: 'FIRST LAYER',
      requirement: 1,
      reward: 'Session recap',
      title: 'Reveal your baseline',
    }),
    buildItem(input, {
      body: 'Two finishes give VEX enough signal to compare how you start and recover.',
      eyebrow: 'NEXT LAYER',
      requirement: 2,
      reward: 'Early pattern read',
      title: 'Find your first rhythm',
    }),
  ];
  const nextItem = items.find((item) => !item.isUnlocked) ?? items[items.length - 1];
  const previewItems = items.filter((item) => !item.isUnlocked).slice(0, 2);

  return HomeUnlockPathModelSchema.parse({
    items,
    nextItem,
    previewItems,
    progressLabel:
      input.completedSessions === 0
        ? 'Complete 1 session to give the system its first signal.'
        : 'Complete 1 more session to sharpen the rhythm read.',
  });
}
