import { renderHook, waitFor } from "@testing-library/react-native";

import { cleanupRealtime, getActiveChannelCount } from "../../services/realtime";
import { usePresence } from "../useRealtime";

type SubscribeCallback = (status: "SUBSCRIBED") => void | Promise<void>;

class MockRealtimeChannel {
  public unsubscribed = false;

  public constructor(public readonly name: string) {}

  public on(): MockRealtimeChannel {
    return this;
  }

  public async subscribe(callback?: SubscribeCallback): Promise<"ok"> {
    if (callback) {
      await callback("SUBSCRIBED");
    }
    return "ok";
  }

  public async track(): Promise<"ok"> {
    return "ok";
  }

  public async unsubscribe(): Promise<"ok"> {
    this.unsubscribed = true;
    return "ok";
  }

  public async send(): Promise<"ok"> {
    return "ok";
  }

  public presenceState(): Record<string, unknown[]> {
    return {};
  }
}

const mockChannels: MockRealtimeChannel[] = [];
const mockClient = {
  channel: (name: string): MockRealtimeChannel => {
    const channel = new MockRealtimeChannel(name);
    mockChannels.push(channel);
    return channel;
  },
};

jest.mock("../../config/supabase", () => ({
  getSupabaseClient: () => mockClient,
}));

describe("usePresence", () => {
  beforeEach(async () => {
    mockChannels.length = 0;
    await cleanupRealtime();
  });

  afterEach(async () => {
    await cleanupRealtime();
  });

  it("cleans up presence channel before remounting", async () => {
    const firstRender = renderHook(() => usePresence({ userId: "user-1" }));
    await waitFor(() => expect(getActiveChannelCount()).toBe(1));

    firstRender.unmount();
    await waitFor(() => expect(getActiveChannelCount()).toBe(0));

    const secondRender = renderHook(() => usePresence({ userId: "user-1" }));
    await waitFor(() => expect(getActiveChannelCount()).toBe(1));

    expect(mockChannels.filter((channel) => !channel.unsubscribed)).toHaveLength(
      1,
    );

    secondRender.unmount();
  });
});
