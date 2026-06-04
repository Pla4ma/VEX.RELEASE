import * as repository from './repository';
import { getOrCreateCoachState } from './persona-manager';
import {
  getRelevantMemories,
  getMilestoneSummary,
  canClaimStrongPattern,
  scopeMemoryForContext,
} from './CoachMemory';
import type { MessageCategory } from './types';

export const MEMORY_MESSAGE_TEMPLATES: Record<
  string,
  Record<string, string[]>
> = {
  MENTOR: {
    FIRST_S_GRADE: [
      "You hit your first S grade {{daysSince}} days ago — that means {{duration}} minutes of pure focus. You're capable of that excellence again.",
      "Remember your first S grade? That wasn't luck — that was skill. You have it in you to do it again.",
      "Your first perfect session showed you what's possible. Time to show yourself again.",
    ],
    LONGEST_SESSION: [
      'Remember when you completed that {{duration}}-minute session? That was a breakthrough. You have that capacity within you.',
      "Your personal best of {{duration}} minutes wasn't a fluke. That focus is still inside you.",
      '{{daysSince}} days ago, you proved you can focus for {{duration}} minutes. Your record is waiting to be broken.',
    ],
    BEST_STREAK: [
      "Your {{streakDays}}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.",
      'You once maintained a {{streakDays}}-day streak. That discipline is still in you — time to reignite it.',
      "The {{streakDays}}-day streak you built wasn't about perfection — it was about showing up. Let's start again.",
    ],
    FIRST_BOSS_DEFEATED: [
      'Your first boss victory against {{bossName}} showed you what focused effort can accomplish. That same determination is available to you now.',
      "Remember defeating {{bossName}}? You have that power right now — it's just waiting to be used.",
      'When you beat {{bossName}}, you proved you can overcome big challenges. Another one awaits.',
    ],
    FIRST_RIVAL_WIN: [
      "You beat {{rivalName}} this week by {{margin}} minutes. They don't know yet — keep the pressure on.",
      'Your victory over {{rivalName}} was earned. Hold your ground this week.',
      '{{rivalName}} is watching their back now. Maintain your edge.',
    ],
    SESSION_COUNT_MILESTONE: [
      "{{totalMemories}} sessions in. You're building a real habit — one session at a time.",
      "You've completed {{totalMemories}} sessions. That's not beginner luck — that's commitment.",
      'Session {{totalMemories}} awaits. Each one compounds into something bigger.',
    ],
  },
  CHEERLEADER: {
    FIRST_S_GRADE: [
      "OMG! Your first S grade {{daysSince}} days ago and you've been CRUSHING IT since! Keep that momentum!",
      'Your first S grade was AMAZING! That focus power is still inside you — use it!',
      'Remember that INCREDIBLE first S grade?! You can absolutely do that again!',
    ],
    LONGEST_SESSION: [
      'That EPIC {{duration}}-minute session?! That was {{daysSince}} days ago and you STILL got it!',
      'Your {{duration}}-minute LEGEND is still the record! Time to beat it!',
      '{{duration}} minutes of PURE FOCUS! You have that POWER right now!',
    ],
    BEST_STREAK: [
      'Your {{streakDays}}-day streak LEGEND is alive! You built that through showing up every day!',
      '{{streakDays}} days of AWESOME! That champion spirit is still in you!',
      'You maintained a {{streakDays}}-day streak! Time to start a new one!',
    ],
    FIRST_BOSS_DEFEATED: [
      'Your first boss takedown of {{bossName}}?! That was EPIC! You have that SAME POWER now!',
      'Remember beating {{bossName}}? You were UNSTOPPABLE! Be that again!',
      '{{bossName}} went DOWN! Another boss awaits your greatness!',
    ],
    FIRST_RIVAL_WIN: [
      "You BEAT {{rivalName}}! They're still recovering from that LOSS!",
      "{{rivalName}} didn't see you coming! Keep them guessing this week!",
      'Your WIN over {{rivalName}} was PERFECT! Make it two in a row!',
    ],
    SESSION_COUNT_MILESTONE: [
      "{{totalMemories}} sessions! You're becoming a FOCUS MACHINE!",
      "Look at you! {{totalMemories}} sessions completed! You're BUILDING something amazing!",
      "Session {{totalMemories}} coming up! You're on FIRE!",
    ],
  },
  DRILL_SERGEANT: {
    FIRST_S_GRADE: [
      "You got your first S grade {{daysSince}} days ago. What happened since? Complacency. You were capable of excellence then, and you're capable now. PROVE IT.",
      "Your first S grade wasn't a gift. You earned it. Now earn another.",
      '{{daysSince}} days since your first perfect session. Pathetic. Get back to work.',
    ],
    LONGEST_SESSION: [
      "{{duration}} minutes. That was your record. Set {{daysSince}} days ago. Pathetic that you haven't beaten it. TODAY IS THE DAY.",
      'Your {{duration}}-minute session is still your best. Weak. Beat it now.',
      "You've coasted for {{daysSince}} days since your record. Enough. Break it today.",
    ],
    BEST_STREAK: [
      "{{streakDays}} days. That was your best. You had discipline then. Where is it now? Find it. Or admit you're weak.",
      'You once maintained {{streakDays}} days. Now you make excuses. Stop.',
      'Your {{streakDays}}-day streak proves you CAN commit. So commit now.',
    ],
    FIRST_BOSS_DEFEATED: [
      '{{bossName}} went down because you had FOCUS. Now you make excuses. Enough. Get back to work.',
      "You beat {{bossName}} through effort. Where's that effort now?",
      'Your first boss victory meant something. Make the next one mean more.',
    ],
    FIRST_RIVAL_WIN: [
      '{{rivalName}} lost to you by {{margin}} minutes. Make it {{doubleMargin}} this week. Crush them.',
      'You beat {{rivalName}} once. Beat them again. And again.',
      '{{rivalName}} is plotting revenge. Destroy their hopes.',
    ],
    SESSION_COUNT_MILESTONE: [
      "{{totalMemories}} sessions. Barely a start. Most people quit at 10. Don't be most people.",
      'Session {{totalMemories}}. Big deal. Talk to me at 100.',
      "{{totalMemories}} isn't a milestone — it's a warm-up. Move faster.",
    ],
  },
};

export async function generateMemoryAwareMessage(
  userId: string,
  category: MessageCategory,
  _personaId: string,
  _baseContext: Record<string, unknown>,
  sessionCount: number = 0,
): Promise<string | null> {
  if (!canClaimStrongPattern(sessionCount)) {
    return null;
  }

  const memories = await getRelevantMemories(userId, category, 2);
  const scopedMemories = memories.filter((m) => {
    const { usable } = scopeMemoryForContext(m, 'generic_coach');
    return usable;
  });
  const milestoneSummary = await getMilestoneSummary(userId);

  if (scopedMemories.length === 0 && milestoneSummary.totalMemories === 0) {
    return null;
  }

  const state = await getOrCreateCoachState(userId);
  const persona = await repository.fetchCoachPersona(state.personaId);
  const personaStyle = persona?.style ?? 'MENTOR';

  const memory = scopedMemories[0];
  const daysSince = memory
    ? Math.floor((Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24))
    : 0;

  const styleTemplates =
    MEMORY_MESSAGE_TEMPLATES[personaStyle] ?? MEMORY_MESSAGE_TEMPLATES.MENTOR;
  if (!styleTemplates) {
    return null;
  }

  const memoryType = memory?.type ?? 'SESSION_COUNT_MILESTONE';
  const typeTemplates =
    styleTemplates[memoryType] ?? styleTemplates.SESSION_COUNT_MILESTONE;
  if (!typeTemplates || typeTemplates.length === 0) {
    return null;
  }

  let selectedTemplate =
    typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  if (!selectedTemplate) {
    return null;
  }

  if (memory) {
    const vars: Record<string, string> = {
      daysSince: String(daysSince),
      duration: String(memory.metadata.duration ?? ''),
      streakDays: String(memory.metadata.streakDays ?? ''),
      bossName: String(memory.metadata.bossName ?? ''),
      rivalName: String(memory.metadata.rivalName ?? ''),
      margin: String(memory.metadata.margin ?? ''),
      totalMemories: String(milestoneSummary.totalMemories),
    };
    if (
      memory.type === 'FIRST_RIVAL_WIN' &&
      personaStyle === 'DRILL_SERGEANT'
    ) {
      const rawMargin = Number(memory.metadata.margin ?? 0);
      vars.doubleMargin = String(rawMargin * 2);
    }
    for (const [key, value] of Object.entries(vars)) {
      selectedTemplate = selectedTemplate.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value,
      );
    }
  } else {
    selectedTemplate = selectedTemplate.replace(
      /\{\{totalMemories\}\}/g,
      String(milestoneSummary.totalMemories),
    );
  }

  return selectedTemplate || null;
}
