import { FeatureFlagService } from "../FeatureFlagService";
import { getStorageManager } from "../../persistence";
import { eventBus } from "../../events";
import { getApiClient } from "../../api/client";

jest.mock("../../persistence");
jest.mock("../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(() => {}),
  },
}));
jest.mock("../../api/client");
jest.mock("../../utils/debug", () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockStorageManager = {
  initialize: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
const mockApiClient = { get: jest.fn() };
jest.mocked(getStorageManager).mockReturnValue(mockStorageManager);
jest.mocked(getApiClient).mockReturnValue(mockApiClient);

describe("FeatureFlagService", () => {
  let service: FeatureFlagService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeatureFlagService({
      storageKey: "test-flags",
      enableOverrides: true,
    });
  });
  describe("Initialization", () => {
    it("should initialize with default flags", async () => {
      mockStorageManager.getItem.mockResolvedValue(null);
      await service.initialize();
      expect(service.isEnabled("new_design")).toBe(false);
      expect(service.isEnabled("preview_features")).toBe(false);
    });
    it("should load persisted flags", async () => {
      const persistedFlags = {
        new_design: {
          key: "new_design",
          value: true,
          description: "Test",
          enabled: true,
          rolloutPercentage: 100,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
      mockStorageManager.getItem.mockResolvedValue(persistedFlags);
      await service.initialize();
      expect(service.isEnabled("new_design")).toBe(true);
    });
    it("should load overrides when enabled", async () => {
      mockStorageManager.getItem.mockImplementation((key: string) => {
        if (key === "test-flags") {
          return Promise.resolve({});
        }
        if (key === "test-flags-overrides") {
          return Promise.resolve({ new_design: true });
        }
        return Promise.resolve(null);
      });
      await service.initialize();
      expect(service.getOverride("new_design")).toBe(true);
    });
    it("should not load overrides when disabled", async () => {
      const serviceNoOverrides = new FeatureFlagService({
        enableOverrides: false,
      });
      mockStorageManager.getItem.mockResolvedValue({});
      await serviceNoOverrides.initialize();
      expect(mockStorageManager.getItem).not.toHaveBeenCalledWith(
        expect.stringContaining("overrides"),
      );
    });
    it("should set user ID for rollout", async () => {
      await service.initialize();
      service.setUserId("user-123");
      expect(service.isEnabled("new_design")).toBe(false);
    });
  });
  describe("Flag Management", () => {
    beforeEach(async () => {
      mockStorageManager.getItem.mockResolvedValue({});
      await service.initialize();
    });
    it("should check if flag exists", () => {
      expect(service.has("new_design")).toBe(true);
      expect(service.has("nonexistent")).toBe(false);
    });
    it("should get flag value", () => {
      const value = service.get("new_design");
      expect(value).toBe(false);
    });
    it("should get all flags", () => {
      const all = service.getAll();
      expect(all).toHaveProperty("new_design");
      expect(all).toHaveProperty("preview_features");
    });
    it("should get enabled flags", () => {
      const enabled = service.getEnabled();
      expect(enabled).toEqual([]);
    });
    it("should update flag", async () => {
      await service.updateFlag({
        key: "new_design",
        value: true,
        enabled: true,
      });
      expect(service.isEnabled("new_design")).toBe(true);
      expect(mockStorageManager.setItem).toHaveBeenCalled();
    });
    it("should throw when updating non-existent flag", async () => {
      await expect(
        service.updateFlag({ key: "nonexistent", value: true }),
      ).rejects.toThrow("Flag nonexistent does not exist");
    });
    it("should register new flag", async () => {
      await service.registerFlag({
        key: "custom_flag",
        value: true,
        description: "Custom flag",
        enabled: true,
        rolloutPercentage: 100,
      });
      expect(service.has("custom_flag")).toBe(true);
      expect(service.isEnabled("custom_flag")).toBe(true);
    });
  });
  describe("Override Management", () => {
    beforeEach(async () => {
      mockStorageManager.getItem.mockResolvedValue({});
      await service.initialize();
    });
    it("should set override", async () => {
      await service.setOverride("new_design", true);
      expect(service.getOverride("new_design")).toBe(true);
      expect(service.isEnabled("new_design")).toBe(true);
    });
    it("should throw when overrides disabled", async () => {
      const serviceNoOverrides = new FeatureFlagService({
        enableOverrides: false,
      });
      await serviceNoOverrides.initialize();
      await expect(
        serviceNoOverrides.setOverride("new_design", true),
      ).rejects.toThrow("Overrides are not enabled");
    });
    it("should clear override", async () => {
      await service.setOverride("new_design", true);
      expect(service.getOverride("new_design")).toBe(true);
      await service.clearOverride("new_design");
      expect(service.getOverride("new_design")).toBeNull();
    });
    it("should clear all overrides", async () => {
      await service.setOverride("new_design", true);
      await service.setOverride("preview_features", true);
      await service.clearAllOverrides();
      expect(service.getOverride("new_design")).toBeNull();
      expect(service.getOverride("preview_features")).toBeNull();
    });
  });
});
