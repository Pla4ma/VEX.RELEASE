import {
  ApiClient,
  getApiClient,
  resetApiClient,
  type ApiConfig,
} from '../client';

const directHttpMessage =
  'Direct HTTP calls are not allowed. Use Supabase client or a repository layer instead.';

function makeClient(config: Partial<ApiConfig> = {}): ApiClient {
  return new ApiClient({
    baseURL: 'https://api.test.com',
    timeout: 100,
    retries: 0,
    retryDelay: 1,
    circuitBreakerThreshold: 10,
    circuitBreakerResetTime: 1_000,
    ...config,
  });
}

async function expectDirectHttpBlocked(
  request: Promise<unknown>,
): Promise<void> {
  await expect(request).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
    message: directHttpMessage,
    retryable: true,
    status: 0,
  });
}

describe('ApiClient regression firewall', () => {
  beforeEach(() => {
    resetApiClient();
  });

  it('blocks direct GET calls', async () => {
    await expectDirectHttpBlocked(makeClient().get('/sessions'));
  });

  it('blocks direct write calls', async () => {
    const client = makeClient();

    await expectDirectHttpBlocked(client.post('/sessions', { duration: 1 }));
    await expectDirectHttpBlocked(client.put('/sessions/1', { duration: 2 }));
    await expectDirectHttpBlocked(client.patch('/sessions/1', { duration: 3 }));
    await expectDirectHttpBlocked(client.delete('/sessions/1'));
  });

  it('opens the circuit after repeated blocked attempts', async () => {
    const client = makeClient({ circuitBreakerThreshold: 2 });

    await expectDirectHttpBlocked(client.get('/first'));
    await expectDirectHttpBlocked(client.get('/second'));

    await expect(client.get('/third')).rejects.toMatchObject({
      code: 'CIRCUIT_OPEN',
      message: 'Service temporarily unavailable',
      retryable: false,
      status: 503,
    });
  });

  it('deduplicates identical blocked requests when requested', async () => {
    const client = makeClient();
    const results = await Promise.allSettled([
      client.get('/same', { deduplicate: true }),
      client.get('/same', { deduplicate: true }),
    ]);

    expect(results).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({ code: 'NETWORK_ERROR' }),
        status: 'rejected',
      }),
      expect.objectContaining({
        reason: expect.objectContaining({ code: 'NETWORK_ERROR' }),
        status: 'rejected',
      }),
    ]);
  });

  it('resets the singleton client instance', () => {
    const first = getApiClient({ baseURL: 'https://api.one.test' });
    const second = getApiClient({ baseURL: 'https://api.two.test' });

    resetApiClient();
    const third = getApiClient({ baseURL: 'https://api.three.test' });

    expect(second).toBe(first);
    expect(third).not.toBe(first);
  });
});
