import { SessionCoachIntegration } from "../SessionCoachIntegration";
import { eventBus } from "../../../events";
import { getAvailabilityFor } from "../../../features/liveops-config/feature-access-store";

jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.mock("../../../features/liveops-config/feature-access-store", () => ({
  getAvailabilityFor: jest.fn(),
}));
const available = {
  state: "unlocked",
  canRenderEntryPoint: true,
  canNavigate: true,
  canQuery: true,
  canUseBackend: true,
  canRegisterRoute: true,
  canSubscribeToEvents: true,
  canShowNotification: true,
  reason: "available",
};

describe("SessionCoachIntegration CoachPresence delegation", () => {
  const eventBusMock = jest.mocked(eventBus);
  const availabilityMock = jest.mocked(getAvailabilityFor);

  beforeEach(() => {
    jest.clearAllMocks();
    availabilityMock.mockReturnValue(
      available as ReturnType<typeof getAvailabilityFor>,
    );
    eventBusMock.subscribe.mockReturnValue(jest.fn());
  });

  it("subscribes only through feature availability", () => {
    availabilityMock.mockReturnValue({
      ...available,
      canSubscribeToEvents: false,
    } as ReturnType<typeof getAvailabilityFor>);

    new SessionCoachIntegration();

    expect(eventBusMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not interrupt active focus for non-critical risk", () => {
    new SessionCoachIntegration();
    const riskHandler = eventBusMock.subscribe.mock.calls.find(
      ([event]) => event === "session:interruption:risk",
    )?.[1];

    riskHandler?.({ sessionId: "s1", riskLevel: "HIGH" });

    expect(eventBusMock.publish).not.toHaveBeenCalledWith(
      "coach:intent",
      expect.any(Object),
    );
  });

  it("uses short CoachPresence copy for critical interruption", () => {
    new SessionCoachIntegration();
    const riskHandler = eventBusMock.subscribe.mock.calls.find(
      ([event]) => event === "session:interruption:risk",
    )?.[1];

    riskHandler?.({ sessionId: "s1", riskLevel: "CRITICAL" });

    expect(eventBusMock.publish).toHaveBeenCalledWith(
      "coach:intent",
      expect.objectContaining({
        context: "interruption_risk",
        message: expect.stringMatching(/clean|restart|pause|reset/i),
      }),
    );
  });

  it("runtime file does not contain old generic coach spam", () => {
    const source = require("fs").readFileSync(
      "src/session/integration/SessionCoachIntegration.ts",
      "utf8",
    ) as string;

    expect(source).not.toMatch(
      /Stay focused|doing great|focus is at risk|You're crushing it|You've got this/,
    );
  });
});
