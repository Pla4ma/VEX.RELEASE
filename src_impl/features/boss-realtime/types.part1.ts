

export const BOSS_RAGE_THRESHOLD = 0.25;

export const BOSS_NEAR_DEATH_THRESHOLD = 0.10;

export const PURE_STRIKE_THRESHOLD = 90;

export const CRITICAL_FOCUS_DURATION = 120;

export const COMBO_THRESHOLD = 3;

export function calculateBaseDamage(sessionDurationMinutes: number): number {
  // Longer sessions = more damage, but with diminishing returns
  return Math.floor(10 + Math.sqrt(sessionDurationMinutes) * 5);
}

export function calculatePurityMultiplier(purityScore: number): number {
  if (purityScore >= 95) {return 2.0;} // Double damage for near-perfect
  if (purityScore >= 80) {return 1.5;}
  if (purityScore >= 60) {return 1.0;}
  if (purityScore >= 40) {return 0.7;}
  return 0.5; // Distracted = weak damage
}

export function calculateComboMultiplier(comboCount: number): number {
  // Each combo hit adds 10% damage, max 3x
  return Math.min(3, 1 + comboCount * 0.1);
}

export function determineAttackType(
  purityScore: number,
  comboCount: number,
  pureFocusDuration: number,
  bossHealthPercent: number
): AttackType {
  if (bossHealthPercent < 0.05 && purityScore > 80) {
    return 'FINISHING_BLOW';
  }
  if (comboCount >= COMBO_THRESHOLD) {
    return 'STREAK_COMBO';
  }
  if (pureFocusDuration >= CRITICAL_FOCUS_DURATION && purityScore > 85) {
    return 'CRITICAL_FOCUS';
  }
  if (purityScore >= PURE_STRIKE_THRESHOLD) {
    return 'PURE_STRIKE';
  }
  return 'NORMAL_FOCUS';
}

export function getAttackVisuals(type: AttackType): {
  color: string;
  size: number;
  shakeIntensity: number;
  particleCount: number;
  message: string;
} {
  switch (type) {
    case 'FINISHING_BLOW':
      return {
        color: 'theme.colors.error.DEFAULT',
        size: 3,
        shakeIntensity: 1,
        particleCount: 50,
        message: 'FINISHING BLOW!',
      };
    case 'STREAK_COMBO':
      return {
        color: 'theme.colors.error.DEFAULT',
        size: 2.5,
        shakeIntensity: 0.7,
        particleCount: 30,
        message: 'COMBO BREAKER!',
      };
    case 'CRITICAL_FOCUS':
      return {
        color: 'theme.colors.error.DEFAULT',
        size: 2,
        shakeIntensity: 0.5,
        particleCount: 20,
        message: 'CRITICAL HIT!',
      };
    case 'PURE_STRIKE':
      return {
        color: 'theme.colors.primary[500]',
        size: 1.5,
        shakeIntensity: 0.3,
        particleCount: 15,
        message: 'PURE STRIKE!',
      };
    default:
      return {
        color: 'theme.colors.background.primary',
        size: 1,
        shakeIntensity: 0.1,
        particleCount: 5,
        message: '',
      };
  }
}