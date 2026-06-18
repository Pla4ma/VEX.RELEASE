import { SessionMode, SessionModeConfig, SESSION_MODE_CONFIG, SessionModeSchema } from './mode-constants';

export function isSessionLessMode(mode: SessionMode): boolean {
  return [
    SessionMode.PLAN,
    SessionMode.REVIEW,
    SessionMode.CAPTURE,
    SessionMode.HABIT,
  ].includes(mode);
}

export function resolveSessionMode(input: unknown): SessionMode {
  const parsed = SessionModeSchema.safeParse(input);
  return parsed.success ? parsed.data : SessionMode.LIGHT_FOCUS;
}

export function getSessionModeConfig(mode: unknown): SessionModeConfig {
  return SESSION_MODE_CONFIG[resolveSessionMode(mode)];
}

export function getRecoveryChainMultiplier(chainCount: number): number {
  const clampedChain = Math.max(1, Math.min(4, Math.floor(chainCount)));
  return 1 + (clampedChain - 1) * 0.05;
}

export function getSprintChainMultiplier(chainCount: number): number {
  return getRecoveryChainMultiplier(chainCount);
}
