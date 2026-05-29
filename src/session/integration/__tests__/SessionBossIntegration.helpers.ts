import { eventBus } from "../../../events";
import {
  consumeBountiesOnDamage,
  recordBountyLootBoost,
  applyDamage,
  getActiveEncounter,
} from "../../../features/boss/service";

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));
