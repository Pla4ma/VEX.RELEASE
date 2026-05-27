import { TimerEngine } from "../TimerEngine";

jest.useFakeTimers();

export { TimerEngine };

export const mockSessionId = "test-session-123";
export const mockCallbacks = {
  onTick: jest.fn(),
  onComplete: jest.fn(),
  onWarning: jest.fn(),
};

export function createEngine(
  duration = 300,
  options = { tickInterval: 1000 },
): TimerEngine {
  return new TimerEngine(mockSessionId, duration, options, mockCallbacks);
}
