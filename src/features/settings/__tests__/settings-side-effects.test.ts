import { describe, expect, it } from "@jest/globals";

jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

import { applySettingSideEffects } from "../settings-side-effects";
import {
  initializeSettingsEventHandlers,
  emitSettingChange,
  emitSettingsReset,
  trackSettingsAnalytics,
} from "../events";

describe("applySettingSideEffects", () => {
  it("does not throw for appearance keys", () => {
    expect(() => applySettingSideEffects("appearance.theme", "dark")).not.toThrow();
    expect(() => applySettingSideEffects("appearance.fontScale", 1.2)).not.toThrow();
    expect(() => applySettingSideEffects("appearance.reduceMotion", true)).not.toThrow();
  });

  it("does not throw for notification keys", () => {
    expect(() => applySettingSideEffects("notifications.push.enabled", true)).not.toThrow();
    expect(() => applySettingSideEffects("notifications.push.enabled", false)).not.toThrow();
    expect(() => applySettingSideEffects("notifications.push.quietHoursStart", 22)).not.toThrow();
  });

  it("does not throw for coach keys", () => {
    expect(() => applySettingSideEffects("coach.enabled", true)).not.toThrow();
    expect(() => applySettingSideEffects("coach.enabled", false)).not.toThrow();
    expect(() => applySettingSideEffects("coach.personality", "tough")).not.toThrow();
  });

  it("does not throw for privacy keys", () => {
    expect(() => applySettingSideEffects("privacy.analyticsOptOut", true)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.analyticsOptOut", false)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.allowDataAnalysis", true)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.profileVisibility", "private")).not.toThrow();
  });

  it("handles unknown keys without error", () => {
    expect(() => applySettingSideEffects("unknown.key", "value")).not.toThrow();
  });
});

describe("settings events", () => {
  it("initializeSettingsEventHandlers returns cleanup function", () => {
    const cleanup = initializeSettingsEventHandlers();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });

  it("emitSettingChange does not throw", () => {
    expect(() => emitSettingChange("test.key", "new", "old")).not.toThrow();
  });

  it("emitSettingsReset does not throw", () => {
    expect(() => emitSettingsReset()).not.toThrow();
    expect(() => emitSettingsReset("notifications")).not.toThrow();
  });

  it("trackSettingsAnalytics does not throw", () => {
    expect(() => trackSettingsAnalytics("change")).not.toThrow();
    expect(() => trackSettingsAnalytics("reset", { category: "all" })).not.toThrow();
    expect(() => trackSettingsAnalytics("export")).not.toThrow();
    expect(() => trackSettingsAnalytics("import")).not.toThrow();
    expect(() => trackSettingsAnalytics("sync")).not.toThrow();
  });
});
