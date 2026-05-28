import { SessionMode } from "../../../session/modes";
import {
  buildPurityState,
  buildSessionViewModel,
} from "../service";
import {
  ACTIVE_SESSION_CONFIG,
  canBackground,
  canPause,
  getActiveSessionConfig,
  getModeSpecificUI,
} from "../active-session-modes";

describe("buildPurityState", () => {
  const basePurityInput = {
    sessionId: "test",
    userId: "user",
    status: "ACTIVE" as const,
    phase: "FOCUSING" as const,
    mode: SessionMode.LIGHT_FOCUS,
    elapsedSeconds: 100,
    remainingSeconds: 1700,
    totalSeconds: 1800,
    isRunning: true,
    pauseCount: 0,
    totalPauseSeconds: 0,
    backgroundTimeSeconds: 0,
    focusInterruptions: 0,
    startedAt: Date.now(),
    isOffline: false,
  };

  it("assigns EXCELLENT for score >= 90", () => {
    const purity = buildPurityState({
      ...basePurityInput,
      purityScore: 95,
    });
    expect(purity.label).toBe("EXCELLENT");
  });
  it("assigns CRITICAL for score < 25", () => {
    const purity = buildPurityState({
      ...basePurityInput,
      purityScore: 10,
      pauseCount: 5,
      totalPauseSeconds: 120,
      backgroundTimeSeconds: 30,
      focusInterruptions: 3,
    });
    expect(purity.label).toBe("CRITICAL");
  });
  it("clamps score to 0-100 range", () => {
    const highPurity = buildPurityState({
      ...basePurityInput,
      purityScore: 150,
    });
    expect(highPurity.score).toBe(100);
    const lowPurity = buildPurityState({
      ...basePurityInput,
      purityScore: -50,
    });
    expect(lowPurity.score).toBe(0);
  });
});

describe("buildSessionViewModel", () => {
  it("builds complete view model", () => {
    const input = {
      sessionId: "session-123",
      userId: "user-456",
      status: "ACTIVE" as const,
      phase: "FOCUSING" as const,
      mode: SessionMode.DEEP_WORK,
      elapsedSeconds: 600,
      remainingSeconds: 1200,
      totalSeconds: 1800,
      isRunning: true,
      purityScore: 88,
      pauseCount: 0,
      totalPauseSeconds: 0,
      backgroundTimeSeconds: 0,
      focusInterruptions: 0,
      startedAt: Date.now(),
      isOffline: false,
    };
    const viewModel = buildSessionViewModel(input);
    expect(viewModel.id).toBe("session-123");
    expect(viewModel.userId).toBe("user-456");
    expect(viewModel.status).toBe("ACTIVE");
    expect(viewModel.mode).toBe(SessionMode.DEEP_WORK);
    expect(viewModel.canPause).toBe(true);
    expect(viewModel.canComplete).toBe(true);
    expect(viewModel.canAbandon).toBe(true);
  });
});

describe("Active Session Modes", () => {
  describe("getActiveSessionConfig", () => {
    it("returns config for each mode", () => {
      Object.values(SessionMode).forEach((mode) => {
        const config = getActiveSessionConfig(mode);
        expect(config).toBeDefined();
        expect(config.mode).toBe(mode);
      });
    });
    it("returns light focus config as fallback", () => {
      const config = getActiveSessionConfig("UNKNOWN" as SessionMode);
      expect(config.mode).toBe(SessionMode.LIGHT_FOCUS);
    });
  });
  describe("getModeSpecificUI", () => {
    it("returns UI config for each mode", () => {
      Object.values(SessionMode).forEach((mode) => {
        const ui = getModeSpecificUI(mode);
        expect(ui).toBeDefined();
        expect(ui.theme).toBeDefined();
      });
    });
  });
  describe("canPause", () => {
    it("allows pause in light focus mode with conditions met", () => {
      expect(canPause(SessionMode.LIGHT_FOCUS, 120, 0)).toBe(true);
    });
    it("disallows pause in sprint mode", () => {
      expect(canPause(SessionMode.SPRINT, 120, 0)).toBe(false);
    });
    it("disallows pause when max pauses reached", () => {
      expect(canPause(SessionMode.LIGHT_FOCUS, 120, 5)).toBe(false);
    });
    it("disallows pause before minimum focus time", () => {
      expect(canPause(SessionMode.DEEP_WORK, 300, 0)).toBe(false);
    });
  });
  describe("canBackground", () => {
    it("allows background in creative mode", () => {
      expect(canBackground(SessionMode.CREATIVE, 300)).toBe(true);
    });
    it("disallows background in sprint mode", () => {
      expect(canBackground(SessionMode.SPRINT, 1)).toBe(false);
    });
    it("disallows background when exceeding limit", () => {
      expect(canBackground(SessionMode.LIGHT_FOCUS, 400)).toBe(false);
    });
  });
  describe("mode configurations", () => {
    it("sprint mode has correct strict settings", () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.SPRINT];
      expect(config.allowPauses).toBe(false);
      expect(config.allowBackground).toBe(false);
      expect(config.strictMode).toBe(true);
    });
    it("deep work mode has correct settings", () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.DEEP_WORK];
      expect(config.maxPauses).toBe(1);
      expect(config.minFocusSecondsBeforePause).toBe(600);
      expect(config.strictMode).toBe(true);
    });
    it("creative mode allows many pauses", () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.CREATIVE];
      expect(config.maxPauses).toBe(10);
      expect(config.companionEnabled).toBe(false);
    });
  });
});
