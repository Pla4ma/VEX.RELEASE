import {
  EvaluateMidSessionEventInputSchema,
  type EvaluateMidSessionEventInput,
  type MidSessionEvent,
} from './schemas';

const EVENT_INTERVAL_SECONDS = 300;
const FIRST_EVENT_SECONDS = 90;

function eventKey(bucket: number, type: MidSessionEvent['type']): string {
  return `mid-session:${bucket}:${type}`;
}

function buildPurityPulse(
  bucket: number,
  purityScore: number,
): MidSessionEvent {
  if (purityScore >= 90) {
    return {
      key: eventKey(bucket, 'COMBO_WINDOW'),
      type: 'COMBO_WINDOW',
      title: 'Pure strike window',
      message: 'Hold this line. Your focus is primed for heavier boss damage.',
      toastType: 'success',
      haptic: 'impactMedium',
    };
  }

  if (purityScore < 60) {
    return {
      key: eventKey(bucket, 'PURITY_PULSE'),
      type: 'PURITY_PULSE',
      title: 'Focus slipping',
      message:
        'The boss is feeding on the drift. One clean minute turns it around.',
      toastType: 'warning',
      haptic: 'warning',
    };
  }

  return {
    key: eventKey(bucket, 'PURITY_PULSE'),
    type: 'PURITY_PULSE',
    title: 'Focus holding',
    message: `Purity is ${Math.round(purityScore)}%. Keep the pressure steady.`,
    toastType: 'info',
    haptic: 'selection',
  };
}

function buildBossTaunt(
  input: EvaluateMidSessionEventInput,
  bucket: number,
): MidSessionEvent | null {
  const health = input.bossHealthPercent;
  const taunts = input.bossTaunts;

  if (!taunts || health === null) {
    return null;
  }

  if (health <= 25 && taunts.nearDeath) {
    return {
      key: eventKey(bucket, 'BOSS_TAUNT'),
      type: 'BOSS_TAUNT',
      title: 'Boss is cracking',
      message: taunts.nearDeath,
      toastType: 'success',
      haptic: 'impactMedium',
    };
  }

  if (health <= 50 && taunts.halfHealth) {
    return {
      key: eventKey(bucket, 'BOSS_TAUNT'),
      type: 'BOSS_TAUNT',
      title: 'Boss taunt',
      message: taunts.halfHealth,
      toastType: 'info',
      haptic: 'impactLight',
    };
  }

  if (input.elapsedSeconds <= FIRST_EVENT_SECONDS + 10 && taunts.spawn) {
    return {
      key: eventKey(bucket, 'BOSS_TAUNT'),
      type: 'BOSS_TAUNT',
      title: 'Boss taunt',
      message: taunts.spawn,
      toastType: 'info',
      haptic: 'selection',
    };
  }

  return null;
}

function buildTimedEvent(
  input: EvaluateMidSessionEventInput,
  bucket: number,
): MidSessionEvent {
  const health = input.bossHealthPercent;

  if (health !== null && health <= 35 && bucket % 3 === 0) {
    return {
      key: eventKey(bucket, 'BOSS_RAGE'),
      type: 'BOSS_RAGE',
      title: 'Rage window',
      message: 'The boss is exposed. Stay clean and this interval hits harder.',
      toastType: 'warning',
      haptic: 'impactMedium',
    };
  }

  if (bucket % 5 === 0) {
    return {
      key: eventKey(bucket, 'DISTRACTION_WAVE'),
      type: 'DISTRACTION_WAVE',
      title: 'Distraction wave',
      message: 'Two minutes of clean focus now protects the whole run.',
      toastType: 'warning',
      haptic: 'warning',
    };
  }

  if (input.purityScore >= 80 && bucket % 2 === 0) {
    return {
      key: eventKey(bucket, 'FOCUS_ZONE'),
      type: 'FOCUS_ZONE',
      title: 'Focus zone',
      message:
        'You found the rhythm. Keep the app foregrounded and let it stack.',
      toastType: 'success',
      haptic: 'impactLight',
    };
  }

  return buildPurityPulse(bucket, input.purityScore);
}

export function evaluateMidSessionEvent(
  input: EvaluateMidSessionEventInput,
): MidSessionEvent | null {
  const validated = EvaluateMidSessionEventInputSchema.parse(input);

  if (validated.isPaused || validated.elapsedSeconds < FIRST_EVENT_SECONDS) {
    return null;
  }

  const bucket =
    validated.elapsedSeconds < EVENT_INTERVAL_SECONDS
      ? 0
      : Math.floor(validated.elapsedSeconds / EVENT_INTERVAL_SECONDS);

  const candidate =
    buildBossTaunt(validated, bucket) ?? buildTimedEvent(validated, bucket);

  if (candidate.key === validated.lastEventKey) {
    return null;
  }

  return candidate;
}
