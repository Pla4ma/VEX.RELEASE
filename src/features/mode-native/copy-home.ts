import type { Lane } from '../lane-engine/types';
import type { ModeHomeSurface, ModeQuickContract } from './schemas';

// ── Evidence-backed home copy (shown when user has session data) ────────

export const EVIDENCE_HOME_COPY: Record<
  Lane,
  Omit<ModeHomeSurface, 'lane'>
> = {
  student: {
    primaryFeeling: 'VEX knows what I should study next.',
    headline: 'Your next study block is ready',
    body: "Review the topic that needs the most attention. VEX tracks what sticks and what doesn't.",
    primaryAction: 'start_study_block',
    primaryActionLabel: 'Start study block',
    suggestedDurationMinutes: 20,
    secondaryHint: '20 minutes. One topic. No distractions.',
    rhythmLabel: 'Best study rhythm: mornings',
  },
  game_like: {
    primaryFeeling: 'VEX knows how to get me moving.',
    headline: 'Start a quest',
    body: 'Your best momentum comes from naming the task first. No boss today — just forward motion.',
    primaryAction: 'start_clean_run',
    primaryActionLabel: 'Start quest',
    suggestedDurationMinutes: 25,
    secondaryHint: 'Name the one thing. Then move.',
    rhythmLabel: 'Best momentum: after first task',
  },
  deep_creative: {
    primaryFeeling: 'VEX remembers where I left off.',
    headline: 'Your create block is waiting',
    body: 'Pick up right where you stopped. The next move is already saved — just resume.',
    primaryAction: 'resume_project',
    primaryActionLabel: 'Resume create block',
    suggestedDurationMinutes: 30,
    secondaryHint: 'Next move is saved. Open the thread.',
    rhythmLabel: 'Deep work window: afternoons',
  },
  minimal_normal: {
    primaryFeeling: 'VEX gets out of the way.',
    headline: 'One focus action',
    body: 'No dashboard. No noise. Just one thing, 15 minutes, done.',
    primaryAction: 'start_session',
    primaryActionLabel: 'Start',
    suggestedDurationMinutes: 15,
    secondaryHint: "One action. 15 minutes. That's it.",
    rhythmLabel: null,
  },
};

// ── Cold-start home copy (shown when VEX has no session evidence) ──────

export const COLD_START_HOME_COPY: Record<
  Lane,
  Omit<ModeHomeSurface, 'lane'>
> = {
  student: {
    primaryFeeling: 'I want to build a study habit.',
    headline: 'Start your next study block',
    body: 'Start with one named study target. VEX will learn what needs review.',
    primaryAction: 'start_study_block',
    primaryActionLabel: 'Start study block',
    suggestedDurationMinutes: 20,
    secondaryHint: 'Name one topic. One block. No distractions.',
    rhythmLabel: null,
  },
  game_like: {
    primaryFeeling: 'I want clean starts to become a pattern.',
    headline: 'Start a quest',
    body: 'Start one small quest. VEX will learn what helps you keep momentum.',
    primaryAction: 'start_clean_run',
    primaryActionLabel: 'Start quest',
    suggestedDurationMinutes: 25,
    secondaryHint: 'Name the one thing. Then move.',
    rhythmLabel: null,
  },
  deep_creative: {
    primaryFeeling: 'I want to protect my deep work.',
    headline: 'Start a create block',
    body: 'Name the project and save the next move after this block.',
    primaryAction: 'resume_project',
    primaryActionLabel: 'Start create block',
    suggestedDurationMinutes: 30,
    secondaryHint: 'Save your next move before closing.',
    rhythmLabel: null,
  },
  minimal_normal: {
    primaryFeeling: 'I want one clean action.',
    headline: 'One focus action',
    body: 'One clean action. VEX will stay quiet unless you ask for more.',
    primaryAction: 'start_session',
    primaryActionLabel: 'Start',
    suggestedDurationMinutes: 15,
    secondaryHint: "One action. 15 minutes. That's it.",
    rhythmLabel: null,
  },
};

// ── Default export for backward compat (evidence-backed) ────────────────

/** @deprecated — use EVIDENCE_HOME_COPY or COLD_START_HOME_COPY explicitly */
export const HOME_COPY = EVIDENCE_HOME_COPY;

// ── Quick Contract copy (no evidence dependency — user fills fields) ────

export const QUICK_CONTRACT_COPY: Record<
  Lane,
  Omit<ModeQuickContract, 'lane'>
> = {
  student: {
    title: 'Quick contract: Study',
    questions: [
      {
        key: 'topic',
        label: 'What are you studying?',
        placeholder: 'e.g. "Graph traversal algorithms"',
      },
      {
        key: 'done',
        label: 'What will count as done?',
        placeholder: 'e.g. "Understand BFS and DFS with examples"',
      },
    ],
    durationLabel: 'Study for',
    suggestedDurationMinutes: 20,
    startLabel: 'Start study block',
    showAdvancedSettings: false,
  },
  game_like: {
    title: 'Quick contract: Quest',
    questions: [
      {
        key: 'task',
        label: 'What do you want to move through?',
        placeholder: 'e.g. "Ship the onboarding flow"',
      },
      {
        key: 'start',
        label: 'What would a clean start look like?',
        placeholder: 'e.g. "Open the file, named the first change"',
      },
    ],
    durationLabel: 'Quest for',
    suggestedDurationMinutes: 25,
    startLabel: 'Start quest',
    showAdvancedSettings: false,
  },
  deep_creative: {
    title: 'Quick contract: Create',
    questions: [
      {
        key: 'project',
        label: 'What are you creating?',
        placeholder: 'e.g. "VEX onboarding redesign"',
      },
      {
        key: 'move',
        label: 'What is the next move?',
        placeholder: 'e.g. "Outline the welcome flow"',
      },
    ],
    durationLabel: 'Protect for',
    suggestedDurationMinutes: 30,
    startLabel: 'Start create block',
    showAdvancedSettings: false,
  },
  minimal_normal: {
    title: 'Quick contract: Focus',
    questions: [
      {
        key: 'action',
        label: 'What is the one action?',
        placeholder: 'e.g. "Clear inbox to zero"',
      },
    ],
    durationLabel: 'Focus for',
    suggestedDurationMinutes: 15,
    startLabel: 'Start focus session',
    showAdvancedSettings: false,
  },
};
