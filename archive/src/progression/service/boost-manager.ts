import { createDebugger } from '../../utils/debug';
import type { XPBoost } from '../schemas';

const debug = createDebugger('progression:boost');

export class BoostManager {
  private activeBoosts = new Map<string, XPBoost>();
  private prestigeMultiplier = 1;

  activateBoost(boostType: string, multiplier: number, duration: number): void {
    const expiresAt = Date.now() + duration;
    this.activeBoosts.set(boostType, { multiplier, expiresAt });
    debug.info('Activated XP boost: %dx for %dms', multiplier, duration);

    setTimeout(() => {
      this.activeBoosts.delete(boostType);
      debug.info('XP boost expired: %s', boostType);
    }, duration);
  }

  calculateActiveBoostMultiplier(): number {
    const now = Date.now();
    let totalMultiplier = 1;

    for (const [type, boost] of this.activeBoosts) {
      if (boost.expiresAt > now) {
        totalMultiplier *= boost.multiplier;
      } else {
        this.activeBoosts.delete(type);
      }
    }

    totalMultiplier *= this.prestigeMultiplier;
    return totalMultiplier;
  }

  setPrestigeMultiplier(multiplier: number): void {
    this.prestigeMultiplier = multiplier;
  }

  clear(): void {
    this.activeBoosts.clear();
    this.prestigeMultiplier = 1;
  }
}
