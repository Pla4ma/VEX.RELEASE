import { TimerEngine } from "./TimerEngine";

jest.useFakeTimers();

const mockSessionId = "test-session-123";
const mockCallbacks = {
  onTick: jest.fn(),
  onComplete: jest.fn(),
  onWarning: jest.fn(),
};

export { mockSessionId, mockCallbacks };

export function createEngine(
  duration = 300,
  opts: { tickInterval?: number; warningThresholds?: number[] } = {},
): TimerEngine {
  return new TimerEngine(
    mockSessionId,
    duration,
    { tickInterval: opts.tickInterval ?? 1000, warningThresholds: opts.warningThresholds },
    mockCallbacks,
  );
}
