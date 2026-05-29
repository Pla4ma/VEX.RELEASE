import type { Lane } from "../lane-engine/types";
import type { ModeHomeSurface, ModeQuickContract } from "./schemas";

// ── Home surface copy ──────────────────────────────────────────────────

export const HOME_COPY: Record<Lane, Omit<ModeHomeSurface, "lane">> = {
  student: {
    primaryFeeling: "VEX knows what I should study next.",
    headline: "Your next study block is ready",
    body: "Review the topic that needs the most attention. VEX tracks what sticks and what doesn't.",
    primaryAction: "start_study_block",
    primaryActionLabel: "Start study block",
    suggestedDurationMinutes: 20,
    secondaryHint: "20 minutes. One topic. No distractions.",
    rhythmLabel: "Best study rhythm: mornings",
  },
  game_like: {
    primaryFeeling: "VEX knows how to get me moving.",
    headline: "Start a clean run",
    body: "Your best momentum comes from naming the task first. No boss today — just forward motion.",
    primaryAction: "start_clean_run",
    primaryActionLabel: "Start clean run",
    suggestedDurationMinutes: 25,
    secondaryHint: "Name the one thing. Then move.",
    rhythmLabel: "Best momentum: after first task",
  },
  deep_creative: {
    primaryFeeling: "VEX remembers where I left off.",
    headline: "Your project is waiting",
    body: "Pick up right where you stopped. The next move is already saved — just resume.",
    primaryAction: "resume_project",
    primaryActionLabel: "Resume project",
    suggestedDurationMinutes: 30,
    secondaryHint: "Next move is saved. Open the thread.",
    rhythmLabel: "Deep work window: afternoons",
  },
  minimal_normal: {
    primaryFeeling: "VEX gets out of the way.",
    headline: "One clean action",
    body: "No dashboard. No noise. Just one thing, 15 minutes, done.",
    primaryAction: "start_session",
    primaryActionLabel: "Start",
    suggestedDurationMinutes: 15,
    secondaryHint: "One action. 15 minutes. That's it.",
    rhythmLabel: null,
  },
};

// ── Quick Contract copy ────────────────────────────────────────────────

export const QUICK_CONTRACT_COPY: Record<Lane, Omit<ModeQuickContract, "lane">> =
  {
    student: {
      title: "Quick contract: Study",
      questions: [
        { key: "topic", label: "What are you studying?", placeholder: 'e.g. "Graph traversal algorithms"' },
        { key: "done", label: "What will count as done?", placeholder: 'e.g. "Understand BFS and DFS with examples"' },
      ],
      durationLabel: "Study for",
      suggestedDurationMinutes: 20,
      startLabel: "Start study block",
      showAdvancedSettings: false,
    },
    game_like: {
      title: "Quick contract: Run",
      questions: [
        { key: "task", label: "What do you want to move through?", placeholder: 'e.g. "Ship the onboarding flow"' },
        { key: "start", label: "What would a clean start look like?", placeholder: 'e.g. "Open the file, named the first change"' },
      ],
      durationLabel: "Run for",
      suggestedDurationMinutes: 25,
      startLabel: "Start run",
      showAdvancedSettings: false,
    },
    deep_creative: {
      title: "Quick contract: Project",
      questions: [
        { key: "project", label: "What project are you protecting?", placeholder: 'e.g. "VEX onboarding redesign"' },
        { key: "move", label: "What is the next move?", placeholder: 'e.g. "Outline the welcome flow"' },
      ],
      durationLabel: "Protect for",
      suggestedDurationMinutes: 30,
      startLabel: "Start project block",
      showAdvancedSettings: false,
    },
    minimal_normal: {
      title: "Quick contract: Clean",
      questions: [
        { key: "action", label: "What is the one action?", placeholder: 'e.g. "Clear inbox to zero"' },
      ],
      durationLabel: "Focus for",
      suggestedDurationMinutes: 15,
      startLabel: "Start clean session",
      showAdvancedSettings: false,
    },
  };
