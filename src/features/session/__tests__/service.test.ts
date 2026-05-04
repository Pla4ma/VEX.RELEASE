import { SessionMode } from '../../../session/modes';
import {
  ACTIVE_SESSION_CONFIG,
  canBackground,
  canPause,
  getActiveSessionConfig,
  getModeSpecificUI,
} from '../active-session-modes';
import {
  buildPurityState,
  buildSessionCapabilities,
  buildSessionViewModel,
  buildTimerState,
  calculateProgressPercentage,
  formatDuration,
} from '../service';

describe('Active Session Service', () => {
  describe('buildSessionCapabilities', () => {
    const baseInput = {
      sessionId: 'test-session',
      userId: 'test-user',
      status: 'ACTIVE' as const,
      phase: 'FOCUSING' as const,
      mode: SessionMode.LIGHT_FOCUS,
      elapsedSeconds: 120,
      remainingSeconds: 1680,
      totalSeconds: 1800,
      isRunning: true,
      purityScore: 85,
      pauseCount: 0,
      totalPauseSeconds: 0,
      backgroundTimeSeconds: 0,
      focusInterruptions: 0,
      startedAt: Date.now(),
      isOffline: false,
    };

    it('allows pause when conditions are met', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canPause).toBe(true);
    });

    it('disallows pause when elapsed time is insufficient', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        elapsedSeconds: 30,
      });
      expect(capabilities.canPause).toBe(false);
    });

    it('disallows pause when max pauses reached', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        pauseCount: 5,
        mode: SessionMode.LIGHT_FOCUS,
      });
      expect(capabilities.canPause).toBe(false);
    });

    it('allows complete after 60 seconds', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canComplete).toBe(true);
    });

    it('disallows complete before 60 seconds', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        elapsedSeconds: 30,
      });
      expect(capabilities.canComplete).toBe(false);
    });

    it('allows abandon when active or paused', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canAbandon).toBe(true);
    });

    it('controls background based on mode config', () => {
      const sprintCapabilities = buildSessionCapabilities({
        ...baseInput,
        mode: SessionMode.SPRINT,
        backgroundTimeSeconds: 10,
      });
      expect(sprintCapabilities.canBackground).toBe(false);

      const lightCapabilities = buildSessionCapabilities({
        ...baseInput,
        mode: SessionMode.LIGHT_FOCUS,
        backgroundTimeSeconds: 10,
      });
      expect(lightCapabilities.canBackground).toBe(true);
    });
  });

  describe('buildTimerState', () => {
    it('builds correct timer state', () => {
      const input = {
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 300,
        remainingSeconds: 1500,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: 80,
        pauseCount: 0,
        totalPauseSeconds: 0,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      };

      const timer = buildTimerState(input);
      expect(timer.elapsedSeconds).toBe(300);
      expect(timer.remainingSeconds).toBe(1500);
      expect(timer.totalSeconds).toBe(1800);
      expect(timer.isRunning).toBe(true);
      expect(timer.lastTickAt).toBeDefined();
    });

    it('does not include lastTickAt when not running', () => {
      const input = {
        sessionId: 'test',
        userId: 'user',
        status: 'PAUSED' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 300,
        remainingSeconds: 1500,
        totalSeconds: 1800,
        isRunning: false,
        purityScore: 80,
        pauseCount: 1,
        totalPauseSeconds: 30,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      };

      const timer = buildTimerState(input);
      expect(timer.lastTickAt).toBeUndefined();
    });
  });

  describe('buildPurityState', () => {
    it('assigns EXCELLENT for score >= 90', () => {
      const purity = buildPurityState({
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 100,
        remainingSeconds: 1700,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: 95,
        pauseCount: 0,
        totalPauseSeconds: 0,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      });
      expect(purity.label).toBe('EXCELLENT');
    });

    it('assigns CRITICAL for score < 25', () => {
      const purity = buildPurityState({
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 100,
        remainingSeconds: 1700,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: 10,
        pauseCount: 5,
        totalPauseSeconds: 120,
        backgroundTimeSeconds: 30,
        focusInterruptions: 3,
        startedAt: Date.now(),
        isOffline: false,
      });
      expect(purity.label).toBe('CRITICAL');
    });

    it('clamps score to 0-100 range', () => {
      const highPurity = buildPurityState({
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 100,
        remainingSeconds: 1700,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: 150,
        pauseCount: 0,
        totalPauseSeconds: 0,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      });
      expect(highPurity.score).toBe(100);

      const lowPurity = buildPurityState({
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 100,
        remainingSeconds: 1700,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: -50,
        pauseCount: 0,
        totalPauseSeconds: 0,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      });
      expect(lowPurity.score).toBe(0);
    });
  });

  describe('buildSessionViewModel', () => {
    it('builds complete view model', () => {
      const input = {
        sessionId: 'session-123',
        userId: 'user-456',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
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
      expect(viewModel.id).toBe('session-123');
      expect(viewModel.userId).toBe('user-456');
      expect(viewModel.status).toBe('ACTIVE');
      expect(viewModel.mode).toBe(SessionMode.DEEP_WORK);
      expect(viewModel.canPause).toBe(true);
      expect(viewModel.canComplete).toBe(true);
      expect(viewModel.canAbandon).toBe(true);
    });
  });

  describe('calculateProgressPercentage', () => {
    it('calculates correct percentage', () => {
      expect(calculateProgressPercentage(900, 1800)).toBe(50);
      expect(calculateProgressPercentage(1800, 1800)).toBe(100);
      expect(calculateProgressPercentage(0, 1800)).toBe(0);
    });

    it('clamps to 0-100 range', () => {
      expect(calculateProgressPercentage(2000, 1800)).toBe(100);
      expect(calculateProgressPercentage(-100, 1800)).toBe(0);
    });

    it('handles zero total seconds', () => {
      expect(calculateProgressPercentage(100, 0)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(3600)).toBe('60:00');
    });
  });
});

describe('Active Session Modes', () => {
  describe('getActiveSessionConfig', () => {
    it('returns config for each mode', () => {
      Object.values(SessionMode).forEach((mode) => {
        const config = getActiveSessionConfig(mode);
        expect(config).toBeDefined();
        expect(config.mode).toBe(mode);
      });
    });

    it('returns light focus config as fallback', () => {
      const config = getActiveSessionConfig('UNKNOWN' as SessionMode);
      expect(config.mode).toBe(SessionMode.LIGHT_FOCUS);
    });
  });

  describe('getModeSpecificUI', () => {
    it('returns UI config for each mode', () => {
      Object.values(SessionMode).forEach((mode) => {
        const ui = getModeSpecificUI(mode);
        expect(ui).toBeDefined();
        expect(ui.theme).toBeDefined();
      });
    });
  });

  describe('canPause', () => {
    it('allows pause in light focus mode with conditions met', () => {
      expect(canPause(SessionMode.LIGHT_FOCUS, 120, 0)).toBe(true);
    });

    it('disallows pause in sprint mode', () => {
      expect(canPause(SessionMode.SPRINT, 120, 0)).toBe(false);
    });

    it('disallows pause when max pauses reached', () => {
      expect(canPause(SessionMode.LIGHT_FOCUS, 120, 5)).toBe(false);
    });

    it('disallows pause before minimum focus time', () => {
      expect(canPause(SessionMode.DEEP_WORK, 300, 0)).toBe(false);
    });
  });

  describe('canBackground', () => {
    it('allows background in creative mode', () => {
      expect(canBackground(SessionMode.CREATIVE, 300)).toBe(true);
    });

    it('disallows background in sprint mode', () => {
      expect(canBackground(SessionMode.SPRINT, 1)).toBe(false);
    });

    it('disallows background when exceeding limit', () => {
      expect(canBackground(SessionMode.LIGHT_FOCUS, 400)).toBe(false);
    });
  });

  describe('mode configurations', () => {
    it('sprint mode has correct strict settings', () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.SPRINT];
      expect(config.allowPauses).toBe(false);
      expect(config.allowBackground).toBe(false);
      expect(config.strictMode).toBe(true);
    });

    it('deep work mode has correct settings', () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.DEEP_WORK];
      expect(config.maxPauses).toBe(1);
      expect(config.minFocusSecondsBeforePause).toBe(600);
      expect(config.strictMode).toBe(true);
    });

    it('creative mode allows many pauses', () => {
      const config = ACTIVE_SESSION_CONFIG[SessionMode.CREATIVE];
      expect(config.maxPauses).toBe(10);
      expect(config.companionEnabled).toBe(false);
    });
  });
});
