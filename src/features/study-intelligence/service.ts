import {
  WeeklyIntelligenceSchema,
  WeakTopicSchema,
  type WeakTopic,
  type WeeklyIntelligence,
} from './schemas';
import type { StudyPlan } from '../study-os/schemas';

function wordFreq(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

function extractTopicKeywords(
  plans: StudyPlan[],
): Map<string, { count: number; lastSeen: number }> {
  const topics = new Map<string, { count: number; lastSeen: number }>();
  for (const plan of plans) {
    for (const block of plan.blocks) {
      const blockWords = wordFreq(block.title + ' ' + block.objective);
      for (const [word, wc] of blockWords) {
        const existing = topics.get(word);
        if (existing) {
          existing.count += wc;
          existing.lastSeen = Math.max(existing.lastSeen, plan.createdAt);
        } else {
          topics.set(word, { count: wc, lastSeen: plan.createdAt });
        }
      }
    }
  }
  return topics;
}

export function computeWeakTopics(
  plans: StudyPlan[],
  now?: number,
): WeakTopic[] {
  const ts = now ?? Date.now();
  const topics = extractTopicKeywords(plans);
  const reviewConfidence = new Map<string, number>();

  for (const plan of plans) {
    for (const item of plan.reviewItems) {
      const words = wordFreq(item.prompt);
      for (const w of words.keys()) {
        const score =
          item.confidence === 'weak'
            ? 0
            : item.confidence === 'medium'
              ? 0.5
              : 1;
        reviewConfidence.set(
          w,
          Math.min(1, (reviewConfidence.get(w) ?? 0) + score),
        );
      }
    }
  }

  const weakTopics: WeakTopic[] = [];
  for (const [topic, data] of topics) {
    const reviewScore = reviewConfidence.get(topic) ?? 0;
    const daysSince = (ts - data.lastSeen) / 86400000;
    const isWeak = reviewScore < 0.5 || (daysSince > 7 && reviewScore < 0.8);

    if (isWeak && data.count >= 1) {
      const confidence = reviewScore < 0.3 ? 'weak' : ('medium' as const);
      weakTopics.push(
        WeakTopicSchema.parse({
          topic,
          confidence,
          reviewCount: Math.round(data.count),
          lastReviewedAt: data.lastSeen,
          suggestedAction:
            confidence === 'weak'
              ? `Revisit ${topic} with a focused review block`
              : `Refresh ${topic} — it has been ${Math.round(daysSince)} days`,
        }),
      );
    }
  }

  return weakTopics.slice(0, 5);
}

export function computeWeeklyIntelligence(input: {
  plans: StudyPlan[];
  streakDays: number;
  now?: number;
}): WeeklyIntelligence {
  const now = input.now ?? Date.now();
  const completedBlocks = input.plans.reduce(
    (sum, p) => sum + p.blocks.filter((b) => b.status === 'completed').length,
    0,
  );
  const totalStudyMinutes = input.plans.reduce(
    (sum, p) => sum + p.blocks.reduce((bs, b) => bs + b.estimatedMinutes, 0),
    0,
  );
  const reviewItemsDue = input.plans.reduce(
    (sum, p) =>
      sum +
      p.reviewItems.filter((r) => r.dueAt !== null && r.dueAt <= now).length,
    0,
  );
  const weakTopics = computeWeakTopics(input.plans, now);

  const suggestion =
    completedBlocks === 0
      ? 'Start your first study block to begin building study intelligence.'
      : weakTopics.length > 0
        ? `${weakTopics.length} topic${weakTopics.length > 1 ? 's' : ''} need${weakTopics.length === 1 ? 's' : ''} review. Start with "${weakTopics[0]?.topic ?? 'the weakest topic'}".`
        : 'All topics look strong. Keep the streak going.';

  return WeeklyIntelligenceSchema.parse({
    generatedAt: now,
    totalStudyMinutes,
    completedBlocks,
    reviewItemsDue,
    weakTopics,
    streakDays: input.streakDays,
    suggestion,
  });
}

export function hasWeeklyIntelligenceData(plans: StudyPlan[]): boolean {
  if (plans.length === 0) {return false;}
  return plans.some((p) => p.blocks.some((b) => b.status === 'completed'));
}
