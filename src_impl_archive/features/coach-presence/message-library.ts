export const COACH_PRESENCE_MESSAGE_CONTEXTS = [
  'day_0_after_motivation',
  'first_session_start',
  'first_session_completion',
  'calm_user_completion',
  'study_user_completion',
  'game_like_user_completion',
  'comeback_session',
  'missed_day_recovery',
  'low_energy_day',
  'strong_streak',
  'long_session',
  'short_session',
  'next_action_tomorrow',
  'ai_fallback_unavailable',
] as const;

export const COACH_PRESENCE_MESSAGE_STYLES = [
  'calm',
  'friendly',
  'coach_led',
  'study_focused',
  'game_like',
  'intense',
] as const;

export type CoachPresenceMessageContext =
  typeof COACH_PRESENCE_MESSAGE_CONTEXTS[number];
export type CoachPresenceMessageStyle =
  typeof COACH_PRESENCE_MESSAGE_STYLES[number];

type MessageMatrix = Record<
  CoachPresenceMessageContext,
  Record<CoachPresenceMessageStyle, string>
>;

const calmProgress = 'Your rhythm is here. Start one clean block.';
const friendlyProgress = 'Nice, the next block has a clear shape.';
const directProgress = 'Next block is clear. Start it clean.';
const studyProgress = 'Keep the thread warm. Review, then continue.';
const gameProgress = 'The run is live. Bank the next block.';
const intenseProgress = 'Momentum is open. Take the next block.';

const MESSAGES: MessageMatrix = {
  ai_fallback_unavailable: {
    calm: 'Start with the last rhythm that worked. One clean block.',
    coach_led: 'Start the saved plan. I will adjust after the block.',
    friendly: 'Use the saved next step. We will tune it after.',
    game_like: 'Run the saved mission. Progress still counts.',
    intense: 'Start the saved target. No drift.',
    study_focused: 'Use the saved study step. Review first.',
  },
  calm_user_completion: {
    calm: 'You finished without forcing it. Let the next block stay simple.',
    coach_led: directProgress,
    friendly: friendlyProgress,
    game_like: gameProgress,
    intense: intenseProgress,
    study_focused: studyProgress,
  },
  comeback_session: {
    calm: 'That return counted. Keep the next block small.',
    coach_led: 'Reset the rhythm. Twenty minutes is enough.',
    friendly: 'You came back. Set one easy follow-up.',
    game_like: 'The run is back in motion. Bank one clean block.',
    intense: 'Reset complete. Take the next target before it cools.',
    study_focused: 'Return block saved. Review before adding new material.',
  },
  day_0_after_motivation: {
    calm: 'VEX will stay quiet and clear. Start one clean block.',
    coach_led: 'I will keep the plan direct. Start the first block.',
    friendly: 'Your setup is ready. Start with one focused block.',
    game_like: 'First mission is simple: finish one clean block.',
    intense: 'Setup is done. Prove the first block.',
    study_focused: 'Your study rhythm starts with one review-ready block.',
  },
  first_session_completion: {
    calm: 'First session is real now. Tomorrow starts with one clean block.',
    coach_led: 'First proof logged. Tomorrow, repeat the clean start.',
    friendly: 'First finish saved. Come back to the next small step.',
    game_like: 'First run banked. Tomorrow starts the next mark.',
    intense: 'First proof logged. Repeat it tomorrow.',
    study_focused: 'First study proof is in. Queue the next review block.',
  },
  first_session_start: {
    calm: 'Keep the target small. Finish the first block clean.',
    coach_led: 'Start the timer. Protect the target.',
    friendly: 'Begin with the work in front of you.',
    game_like: 'Mission one: finish the block.',
    intense: 'Timer on. Nothing extra.',
    study_focused: 'Start with the material you can review after.',
  },
  game_like_user_completion: {
    calm: calmProgress,
    coach_led: directProgress,
    friendly: friendlyProgress,
    game_like: 'Damage landed. Spend the momentum on one more clean run.',
    intense: 'Damage landed. Press the next target while it is warm.',
    study_focused: studyProgress,
  },
  long_session: {
    calm: 'Long block held. Make the next move lighter.',
    coach_led: 'Long block complete. Recover, then choose the next target.',
    friendly: 'That was a long hold. Give the next step room.',
    game_like: 'Big run banked. Cool down before the next push.',
    intense: 'Long hold complete. Recover fast, then reset the target.',
    study_focused: 'Long study block held. Review before adding more.',
  },
  low_energy_day: {
    calm: 'Low energy, still finished. Recovery is the next action.',
    coach_led: 'Energy was low. Keep the next block short.',
    friendly: 'You still landed the block. Take the easy next step.',
    game_like: 'Low-energy run banked. Keep the next mission light.',
    intense: 'Low energy noted. Short target next.',
    study_focused: 'Low energy study counts. Review only next.',
  },
  missed_day_recovery: {
    calm: 'You are not behind. Start with one clean session.',
    coach_led: 'Reset the rhythm. Start one contained block.',
    friendly: 'Come back small. One block is enough.',
    game_like: 'The run is not over. One clean block restarts motion.',
    intense: 'No speech. Reset with one block.',
    study_focused: 'Do one review block before new material.',
  },
  next_action_tomorrow: {
    calm: 'Tomorrow, start with the smallest useful block.',
    coach_led: 'Tomorrow opens with the next clear target.',
    friendly: 'Tomorrow has one simple first move.',
    game_like: 'Tomorrow starts the next run.',
    intense: 'Tomorrow, take the first target immediately.',
    study_focused: 'Tomorrow, review the thread before new work.',
  },
  short_session: {
    calm: 'Short block landed. Let it lower the next start.',
    coach_led: 'Short block saved. Stack one controlled follow-up.',
    friendly: 'Small finish saved. One more would fit.',
    game_like: 'Quick run banked. Stack the next mark.',
    intense: 'Short block saved. Do not drift.',
    study_focused: 'Short review counted. Queue the next pass.',
  },
  strong_streak: {
    calm: 'Your rhythm is stable. Protect the next clean start.',
    coach_led: 'Consistency is visible. Repeat the start.',
    friendly: 'The pattern is showing. Keep the next step easy.',
    game_like: 'The run has teeth. One more block adds damage.',
    intense: 'Streak is live. Use it now.',
    study_focused: 'Study rhythm is forming. Review, then continue.',
  },
  study_user_completion: {
    calm: calmProgress,
    coach_led: directProgress,
    friendly: friendlyProgress,
    game_like: gameProgress,
    intense: intenseProgress,
    study_focused: 'Study thread stayed alive. Queue the next review pass.',
  },
};

export function getCoachPresenceMessage(input: {
  context: CoachPresenceMessageContext;
  style: CoachPresenceMessageStyle;
}): string {
  return MESSAGES[input.context][input.style];
}
