import type { CoachPersona } from './intervention-types';

export function generateBurnoutMessage(
  sessionsLast24h: number,
  avgQuality: number,
  persona: CoachPersona = 'MENTOR',
): string {
  const messages: Record<string, string> = {
    MENTOR: `You've completed ${sessionsLast24h} sessions in 24 hours — impressive dedication. Quality scores are averaging ${avgQuality}%. To maintain your streak long-term, consider a shorter, focused session today. Quality over quantity.`,
    CHEERLEADER: `Whoa superstar! 🔥 ${sessionsLast24h} sessions?! You're ON FIRE! Quality trending at ${avgQuality}%. Let's keep that streak strong with a quick 15-min power session. You've got this!`,
    DRILL_SERGEANT: `Listen up. ${sessionsLast24h} sessions shows discipline, but ${avgQuality}% quality is UNACCEPTABLE. Your streak is at risk. Take a 15-minute focused session. NOW. Quality before ego.`,
  };

  return messages[persona] ?? messages.MENTOR!;
}

export function generatePlateauMessage(
  dropPercent: number,
  sessionsPerWeekTrend: string,
  persona: CoachPersona = 'MENTOR',
): string {
  const trendText =
    sessionsPerWeekTrend === 'DECREASING'
      ? 'I also see your session frequency dropping.'
      : 'Your session count is steady, but intensity is down.';

  const messages: Record<string, string> = {
    MENTOR: `Your XP growth has slowed ${dropPercent.toFixed(0)}% this week. ${trendText} You've hit a plateau — this is normal. To break through, try a longer session at your peak focus time. Growth happens outside comfort zones.`,
    CHEERLEADER: `Hey champ! 🏆 XP growth dipped ${dropPercent.toFixed(0)}% this week. No worries — plateaus happen! ${trendText} Let's CRUSH this with a 60-min powerhouse session. You're stronger than this plateau! 💪`,
    DRILL_SERGEANT: `Your numbers are DROPPING. ${dropPercent.toFixed(0)}% decline. ${trendText} This is complacency. You think you're working hard? You're coasting. 60 minutes. Today. NO EXCUSES.`,
  };

  return messages[persona] ?? messages.MENTOR!;
}

export function generateStreakRescueMessage(
  streakDays: number,
  hoursRemaining: number,
  persona: CoachPersona = 'MENTOR',
): string {
  const timeText =
    hoursRemaining <= 2 ? `${hoursRemaining} HOURS` : `${hoursRemaining} hours`;

  const messages: Record<string, string> = {
    MENTOR: `Your ${streakDays}-day streak is at risk. You have ${timeText} remaining. I've analyzed your patterns — a 15-minute session right now will maintain your momentum. Your future self will thank you.`,
    CHEERLEADER: `Oh no! 😱 Your 🔥 ${streakDays}-day streak is about to break! Only ${timeText} left! But don't worry — I'm here! A quick 15-min session saves it all. You can do this! Tap below! 🔥`,
    DRILL_SERGEANT: `DISASTER INCOMING. Your ${streakDays}-day streak breaks in ${timeText}. This is what happens when you procrastinate. 15 minutes. RIGHT NOW. Move.`,
  };

  return messages[persona] ?? messages.MENTOR!;
}

export function generateBossStrategyMessage(
  bossHealthPercent: number,
  timeRemaining: number,
  streakMultiplier: number,
  persona: CoachPersona = 'MENTOR',
): string {
  const messages: Record<string, string> = {
    MENTOR: `The boss is near defeat at ${bossHealthPercent.toFixed(0)}% health. With ${timeRemaining} hours remaining and your ${streakMultiplier}x streak multiplier active, a 45-minute S-quality session will deal the killing blow. This is your moment.`,
    CHEERLEADER: `OMG! 🎯 The boss is ALMOST DOWN! ${bossHealthPercent.toFixed(0)}% health left! Your ${streakMultiplier}x streak multiplier is CRUSHING IT! One epic 45-min S-quality session = BOOM! Victory! Let's DO THIS! 💥`,
    DRILL_SERGEANT: `FINISH HIM. ${bossHealthPercent.toFixed(0)}% health. ${timeRemaining} hours. ${streakMultiplier}x multiplier. 45 minutes. S-quality. No pauses. This is what you've trained for. ATTACK.`,
  };

  return messages[persona] ?? messages.MENTOR!;
}
