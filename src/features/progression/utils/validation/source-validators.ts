import {
  type XPTransaction,
  type ValidationResult,
  MAX_STREAK_BONUS_MULTIPLIER,
  MAX_QUALITY_BONUS,
  getNumberFromMetadata,
} from "./types";

// ── Source-Specific Dispatch ────────────────────────────────────────────────

export function validateSourceSpecific(
  transaction: XPTransaction,
  userHistory: {
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
  result: ValidationResult<XPTransaction>,
): void {
  switch (transaction.source) {
    case "SESSION_COMPLETE":
      validateSessionXP(transaction, userHistory, result);
      break;
    case "STREAK_BONUS":
      validateStreakBonus(transaction, result);
      break;
    case "SESSION_QUALITY":
      validateQualityBonus(transaction, result);
      break;
    case "BOSS_DAMAGE":
      validateBossDamageXP(transaction, result);
      break;
  }
}

// ── Session XP ──────────────────────────────────────────────────────────────

function validateSessionXP(
  transaction: XPTransaction,
  userHistory: {
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
  result: ValidationResult<XPTransaction>,
): void {
  const session = userHistory.sessionHistory.find(
    (s) => Math.abs(s.timestamp - transaction.timestamp) < 60000,
  );

  if (!session) {
    result.warnings.push({
      field: "sourceId",
      message: "No matching session found for session XP",
      code: "ORPHAN_SESSION_XP",
    });
    return;
  }

  const xpPerMinute = transaction.amount / (session.duration / 60000);
  const maxXPPerMinute = 100;

  if (xpPerMinute > maxXPPerMinute) {
    result.violations.push({
      type: "SUSPICIOUS",
      field: "amount",
      message: `XP per minute ratio too high: ${xpPerMinute.toFixed(1)} XP/min`,
      severity: "HIGH",
      details: {
        xpPerMinute,
        maxAllowed: maxXPPerMinute,
        duration: session.duration,
      },
    });
    result.riskScore += 30;
  }

  if (session.duration < 60000 && transaction.amount > 100) {
    result.violations.push({
      type: "SUSPICIOUS",
      field: "amount",
      message: "High XP for very short session",
      severity: "MEDIUM",
      details: { duration: session.duration, xp: transaction.amount },
    });
    result.riskScore += 15;
  }
}

// ── Streak Bonus ────────────────────────────────────────────────────────────

function validateStreakBonus(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>,
): void {
  const multiplier = getNumberFromMetadata(transaction.metadata, "multiplier");

  if (multiplier !== undefined && multiplier > MAX_STREAK_BONUS_MULTIPLIER) {
    result.violations.push({
      type: "POLICY",
      field: "metadata.multiplier",
      message: `Streak multiplier ${multiplier} exceeds maximum ${MAX_STREAK_BONUS_MULTIPLIER}`,
      severity: "MEDIUM",
      details: { multiplier, max: MAX_STREAK_BONUS_MULTIPLIER },
    });
    result.riskScore += 20;
  }
}

// ── Quality Bonus ───────────────────────────────────────────────────────────

function validateQualityBonus(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>,
): void {
  const multiplier = getNumberFromMetadata(
    transaction.metadata,
    "qualityMultiplier",
  );

  if (multiplier !== undefined && multiplier > MAX_QUALITY_BONUS) {
    result.violations.push({
      type: "POLICY",
      field: "metadata.qualityMultiplier",
      message: `Quality multiplier ${multiplier} exceeds maximum ${MAX_QUALITY_BONUS}`,
      severity: "MEDIUM",
      details: { multiplier, max: MAX_QUALITY_BONUS },
    });
    result.riskScore += 20;
  }
}

// ── Boss Damage XP ──────────────────────────────────────────────────────────

function validateBossDamageXP(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>,
): void {
  const damage = getNumberFromMetadata(transaction.metadata, "damage");

  if (damage !== undefined) {
    const expectedXP = damage / 10;
    const ratio = transaction.amount / expectedXP;

    if (ratio > 3) {
      result.violations.push({
        type: "SUSPICIOUS",
        field: "amount",
        message: `Boss XP ratio suspicious: ${ratio.toFixed(1)}x expected`,
        severity: "HIGH",
        details: { damage, expectedXP, actualXP: transaction.amount, ratio },
      });
      result.riskScore += 25;
    }
  }
}
