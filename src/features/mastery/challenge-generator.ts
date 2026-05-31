import type {
  MasteryState,
  MasteryChallenge,
  MasteryRank,
  TechniqueKey,
  ChallengeTemplate,
} from './types';
import { FOCUS_CHALLENGES } from './challenge-data-focus';
import { RESILIENCE_CHALLENGES } from './challenge-data-resilience';

const challengeTemplates: Record<TechniqueKey, ChallengeTemplate[]> = {
  ...FOCUS_CHALLENGES,
  ...RESILIENCE_CHALLENGES,
};

export function generateMasteryChallenges(
  techniques: MasteryState['techniques'],
  _currentRank: MasteryRank,
): MasteryChallenge[] {
  const challenges: MasteryChallenge[] = [];
  const techniqueEntries = Object.entries(techniques) as [
    TechniqueKey,
    number,
  ][];
  const lowestTechnique = techniqueEntries.sort((a, b) => a[1] - b[1])[0];
  if (!lowestTechnique) {return challenges;}
  const techKey = lowestTechnique[0];
  const techLevel = lowestTechnique[1];
  if (!techKey || techLevel === undefined) {return challenges;}

  let targetDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';
  if (techLevel < 5) {
    targetDifficulty = 'EASY';
  } else if (techLevel < 15) {
    targetDifficulty = 'MEDIUM';
  } else if (techLevel < 25) {
    targetDifficulty = 'HARD';
  } else {
    targetDifficulty = 'ELITE';
  }

  const templates = challengeTemplates[techKey];
  if (!templates) {return challenges;}
  const matchingTemplate =
    templates.find((t) => t.difficulty === targetDifficulty) ?? templates[0];
  if (!matchingTemplate) {return challenges;}
  challenges.push({
    id: `mastery_${techKey}_${Date.now()}`,
    technique: techKey,
    title: matchingTemplate.title,
    description: matchingTemplate.description,
    difficulty: matchingTemplate.difficulty,
    target: matchingTemplate.target,
    current: 0,
    unit: matchingTemplate.unit,
    masteryPoints: matchingTemplate.points,
    status: 'ACTIVE',
    completedAt: null,
  });

  const filteredEntries = techniqueEntries.filter((t) => t[0] !== techKey);
  const randomIndex = Math.floor(Math.random() * 4);
  const otherTechnique = filteredEntries[randomIndex];
  if (!otherTechnique) {return challenges;}
  const otherKey = otherTechnique[0];
  if (!otherKey) {return challenges;}
  const otherTemplates = challengeTemplates[otherKey];
  if (!otherTemplates) {return challenges;}
  const otherTemplate =
    otherTemplates[Math.floor(Math.random() * otherTemplates.length)];
  if (!otherTemplate) {return challenges;}
  challenges.push({
    id: `mastery_${otherKey}_${Date.now()}_2`,
    technique: otherKey,
    title: otherTemplate.title,
    description: otherTemplate.description,
    difficulty: otherTemplate.difficulty,
    target: otherTemplate.target,
    current: 0,
    unit: otherTemplate.unit,
    masteryPoints: otherTemplate.points,
    status: 'ACTIVE',
    completedAt: null,
  });

  return challenges;
}
