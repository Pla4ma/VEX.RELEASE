import type { ValidationResult } from "./types";

// ── Level Up ────────────────────────────────────────────────────────────────

export function validateLevelUp(
  currentLevel: number,
  currentXP: number,
  newXP: number,
  levelCurve: number[],
): ValidationResult<{ newLevel: number; levelsGained: number }> {
  const result: ValidationResult<{ newLevel: number; levelsGained: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
  };

  if (currentLevel < 1) {
    result.violations.push({
      type: "IMPOSSIBLE",
      field: "currentLevel",
      message: "Current level cannot be less than 1",
      severity: "CRITICAL",
    });
    result.valid = false;
    result.riskScore = 100;
    return result;
  }

  if (currentXP < 0 || newXP < 0) {
    result.violations.push({
      type: "IMPOSSIBLE",
      field: "xp",
      message: "XP values cannot be negative",
      severity: "CRITICAL",
    });
    result.valid = false;
    result.riskScore = 100;
    return result;
  }

  if (newXP < currentXP) {
    result.violations.push({
      type: "SUSPICIOUS",
      field: "newXP",
      message: "New XP is less than current XP (possible rollback attempt)",
      severity: "HIGH",
    });
    result.riskScore += 40;
  }

  // Walk the level curve
  let level = 1;
  let xpNeeded = 0;
  for (let i = 0; i < levelCurve.length; i++) {
    xpNeeded += levelCurve[i]!;
    if (newXP >= xpNeeded) {
      level = i + 2;
    } else {
      break;
    }
  }

  const levelsGained = level - currentLevel;

  if (levelsGained > 10) {
    result.violations.push({
      type: "SUSPICIOUS",
      field: "levelsGained",
      message: `Large level jump detected: +${levelsGained} levels`,
      severity: "MEDIUM",
    });
    result.riskScore += 25;
  }

  const MAX_LEVEL = 100;
  if (level > MAX_LEVEL) {
    result.violations.push({
      type: "POLICY",
      field: "newLevel",
      message: `Level ${level} exceeds maximum ${MAX_LEVEL}`,
      severity: "MEDIUM",
    });
    level = MAX_LEVEL;
  }

  result.data = { newLevel: level, levelsGained };

  if (result.riskScore > 50) {
    result.valid = false;
  }

  return result;
}

// ── Prestige ────────────────────────────────────────────────────────────────

export function validatePrestige(
  currentLevel: number,
  currentPrestige: number,
  minLevelForPrestige: number = 100,
): ValidationResult<{ canPrestige: boolean; prestigeLevel: number }> {
  const result: ValidationResult<{
    canPrestige: boolean;
    prestigeLevel: number;
  }> = { valid: true, violations: [], warnings: [], riskScore: 0 };

  if (currentLevel < minLevelForPrestige) {
    result.valid = false;
    result.violations.push({
      type: "POLICY",
      field: "currentLevel",
      message: `Must be level ${minLevelForPrestige} to prestige (currently ${currentLevel})`,
      severity: "MEDIUM",
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  const MAX_PRESTIGE = 10;
  if (currentPrestige >= MAX_PRESTIGE) {
    result.valid = false;
    result.violations.push({
      type: "POLICY",
      field: "currentPrestige",
      message: `Maximum prestige level (${MAX_PRESTIGE}) already reached`,
      severity: "MEDIUM",
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  result.data = { canPrestige: true, prestigeLevel: currentPrestige + 1 };
  return result;
}
