import { bootstrapApp } from '../bootstrap';

const mockResolveEncryptionKey = jest.fn<Promise<string>, []>();
const mockInitializeAnalyticsEventBridge = jest.fn<void, []>();
const mockInitializeSessionCompletionOrchestrator = jest.fn<void, []>();
const mockGetQueueLength = jest.fn<number, []>(() => 0);
const mockStartAutoProcessing = jest.fn<void, []>();
const mockInitializeNetInfo = jest.fn<void, []>();

jest.mock('../../persistence/mmkv-key', () => ({
  getMmkvEncryptionKey: mockResolveEncryptionKey,
}));
jest.mock('../../network/NetInfoAdapter', () => ({
  getNetInfoAdapter: () => ({ initialize: mockInitializeNetInfo }),
}));
jest.mock('../../lib/offline/queue', () => ({
  getQueueLength: mockGetQueueLength,
  startAutoProcessing: mockStartAutoProcessing,
}));
jest.mock('../../shared/analytics/analytics-service', () => ({
  analyticsService: { initialize: jest.fn(() => Promise.resolve(false)) },
  capture: jest.fn(),
}));
jest.mock('../../shared/analytics/event-bus-bridge', () => ({
  initializeAnalyticsEventBridge: mockInitializeAnalyticsEventBridge,
}));
jest.mock('../../shared/analytics/product-events', () => ({
  ProductAnalyticsEvents: { APP_OPENED: 'app_opened' },
}));
jest.mock('../../errors/globalErrorHandlers', () => ({
  setupGlobalErrorHandler: jest.fn(),
  setupRejectionHandler: jest.fn(),
}));
jest.mock('../../features/session-completion/completion-orchestrator-init', () => ({
  initializeSessionCompletionOrchestrator: mockInitializeSessionCompletionOrchestrator,
}));
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
    setErrorCapture: jest.fn(),
  }),
}));

describe('bootstrap readiness', () => {
  beforeEach(() => {
    mockResolveEncryptionKey.mockReset();
    mockInitializeAnalyticsEventBridge.mockReset();
    mockInitializeSessionCompletionOrchestrator.mockReset();
    mockGetQueueLength.mockReturnValue(0);
    mockStartAutoProcessing.mockReset();
    mockInitializeNetInfo.mockReset();
  });

  it('shares the in-flight bootstrap and waits for the encryption key', async () => {
    let resolveKey: ((key: string) => void) | undefined;
    mockResolveEncryptionKey.mockImplementation(
      () => new Promise<string>((resolve) => {
        resolveKey = resolve;
      }),
    );

    const first = bootstrapApp();
    const second = bootstrapApp();
    expect(first).toBe(second);

    resolveKey?.('test-key');
    await expect(first).resolves.toBeUndefined();
  });
});
