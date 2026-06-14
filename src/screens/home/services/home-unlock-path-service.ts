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
      body: 'Finish one focus session. VEX uses that evidence to build your first recap.',
      eyebrow: 'FIRST SIGNAL',
      requirement: 1,
      reward: 'Session recap',
      title: 'Reveal your baseline',
    }),
    buildItem(input, {
      body: 'Two finishes give VEX enough signal to compare how you start.',
      eyebrow: 'PATTERN',
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
        ? 'Complete 1 session to wake the app.'
        : 'Complete 1 more session to reveal your rhythm.',
  });
}
