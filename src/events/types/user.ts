/**
 * User Events
 */

import type { User } from "../../types/models";

export interface UserEventDefinitions {
  "user:profile:update": { user: User; changes: Partial<User> };
  "user:settings:update": { settings: Record<string, unknown> };
  "user:recruited": { referrerId: string; recruitedId: string };
}
