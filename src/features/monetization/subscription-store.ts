import { mmkvStorage } from "../../store/mmkv-storage";
import type { UserSubscription } from "./PremiumTierSystem";

const STORE_KEY = "vex:subscriptions";

function loadAll(): Record<string, UserSubscription> {
  try {
    const raw = mmkvStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserSubscription>) : {};
  } catch (error: unknown) {
    return {};
  }
}

function saveAll(data: Record<string, UserSubscription>): void {
  mmkvStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getSubscription(userId: string): UserSubscription | null {
  const all = loadAll();
  return all[userId] ?? null;
}

function setSubscription(sub: UserSubscription): void {
  const all = loadAll();
  all[sub.userId] = sub;
  saveAll(all);
}

export const subscriptionStore = {
  getSubscription,
  setSubscription,
};
