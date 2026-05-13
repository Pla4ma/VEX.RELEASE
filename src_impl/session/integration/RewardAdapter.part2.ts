import { eventBus } from "../../events";
import { getRewardService } from "../../rewards/RewardService";
import type { SessionSummary } from "../types";
import { createDebugger } from "../../utils/debug";


export function createRewardAdapter(): RewardAdapter {
  return new RewardAdapter();
}

export function getRewardAdapter(): RewardAdapter {
  if (!adapterInstance) {
    adapterInstance = new RewardAdapter();
  }
  return adapterInstance;
}