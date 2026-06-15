import {
  Day0AgentInputSchema,
  Day0AgentPlanSchema,
  type Day0AgentInput,
  type Day0AgentPlan,
  type Day0Mode,
  type Day0PlanStep,
} from './day0-agent-schemas';

const MODE_COPY: Record<Day0Mode, { title: string; verb: string; tag: string }> = {
  focus: { title: 'First Focus Signal', verb: 'focus', tag: 'focus' },
  create: { title: 'First Create Signal', verb: 'build', tag: 'create' },
  study: { title: 'First Study Signal', verb: 'study', tag: 'study' },
  quest: { title: 'First Quest Signal', verb: 'clear', tag: 'quest' },
};

function cleanIntent(intent: string): string {
  const trimmed = intent.trim().replace(/\s+/g, ' ');
  return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
}

function buildSteps(mode: Day0Mode, intent: string): Day0PlanStep[] {
  const copy = MODE_COPY[mode];
  return [
    {
      title: `Name the ${copy.verb} target`,
      description: `Turn "${intent}" into one clear next move before VEX asks for a timer.`,
      estimatedMinutes: 3,
      priority: 'medium',
      tags: ['day0', copy.tag],
    },
    {
      title: `Prepare the first ${copy.verb} block`,
      description: 'Remove one blocker, open the right material, and make the action easy to start.',
      estimatedMinutes: 7,
      priority: mode === 'quest' ? 'high' : 'medium',
      tags: ['day0', copy.tag],
    },
    {
      title: 'Choose the smallest finish line',
      description: 'Define what counts as done today so VEX can read your first signal without pressure.',
      estimatedMinutes: 5,
      priority: 'medium',
      tags: ['day0', copy.tag],
    },
  ];
}

export function buildDay0AgentPlan(rawInput: Day0AgentInput): Day0AgentPlan {
  const input = Day0AgentInputSchema.parse(rawInput);
  const intent = cleanIntent(input.intent);
  const copy = MODE_COPY[input.mode];

  return Day0AgentPlanSchema.parse({
    mode: input.mode,
    title: copy.title,
    summary: `VEX turned "${intent}" into a tiny ${copy.verb} path. No full session required yet.`,
    steps: buildSteps(input.mode, intent),
  });
}
