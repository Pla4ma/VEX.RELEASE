import { PurchaseRepository, PurchaseRepositoryError, purchaseRepository } from '../PurchaseRepository';

// Mock react-native-mmkv
const mockStorage = new Map<string, string>();
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key: string) => mockStorage.get(key) ?? undefined),
    set: jest.fn((key: string, value: string) => { mockStorage.set(key, value); }),
    delete: jest.fn((key: string) => { mockStorage.delete(key); }),
    contains: jest.fn((key: string) => mockStorage.has(key)),
    getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
  })),
}));

jest.mock('../../../persistence/mmkv-runtime', () => {
  const stores = new Map<string, Map<string, string | boolean | number | Uint8Array>>();
  return {
    createRuntimeMMKV: (configuration: { id: string }) => {
      const store = stores.get(configuration.id) ?? new Map<string, string | boolean | number | Uint8Array>();
      stores.set(configuration.id, store);
      return {
        set: (key: string, value: string | boolean | number | Uint8Array) => { store.set(key, value); },
        getString: (key: string) => typeof store.get(key) === 'string' ? store.get(key) as string : undefined,
        getBoolean: (key: string) => typeof store.get(key) === 'boolean' ? store.get(key) as boolean : undefined,
        getNumber: (key: string) => typeof store.get(key) === 'number' ? store.get(key) as number : undefined,
        contains: (key: string) => store.has(key),
        delete: (key: string) => { store.delete(key); },
        getAllKeys: () => Array.from(store.keys()),
        clearAll: () => { store.clear(); },
      };
    },
  };
});

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('PurchaseRepository', () => {
  let repo: PurchaseRepository;

  beforeEach(() => {
    mockStorage.clear();
    // Clear the MMKV storage used by PurchaseRepository
    const { createRuntimeMMKV } = require('../../../persistence/mmkv-runtime');
    const store = createRuntimeMMKV({ id: 'monetization-repo' });
    store.clearAll();
    repo = new PurchaseRepository();
  });

  const mockPurchase = {
    transactionId: 'tx-1',
    productId: 'prod-1',
    price: 9.99,
    currency: 'USD' as const,
    platform: 'ios' as const,
    purchasedAt: Date.now(),
    receipt: 'receipt-data',
    userId: 'user-1',
  };

  const mockSubscription = {
    id: 'sub-1',
    productId: 'prod-1',
    status: 'active' as const,
    startedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    platform: 'ios' as const,
    userId: 'user-1',
  };

  describe('getPurchases', () => {
    it('returns empty array when no purchases', async () => {
      const result = await repo.getPurchases('user-1');
      expect(result).toEqual([]);
    });

    it('returns saved purchases', async () => {
      await repo.savePurchase('user-1', mockPurchase);
      const result = await repo.getPurchases('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe('tx-1');
    });

    it('returns empty array on parse error', async () => {
      mockStorage.set('purchases:user-1', 'invalid-json');
      const result = await repo.getPurchases('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('savePurchase', () => {
    it('adds a new purchase', async () => {
      await repo.savePurchase('user-1', mockPurchase);
      const purchases = await repo.getPurchases('user-1');
      expect(purchases).toHaveLength(1);
    });

    it('updates existing purchase by transactionId', async () => {
      await repo.savePurchase('user-1', mockPurchase);
      await repo.savePurchase('user-1', { ...mockPurchase, price: 19.99 });
      const purchases = await repo.getPurchases('user-1');
      expect(purchases).toHaveLength(1);
      expect(purchases[0].price).toBe(19.99);
    });

    it('separates purchases by userId', async () => {
      await repo.savePurchase('user-1', mockPurchase);
      await repo.savePurchase('user-2', { ...mockPurchase, transactionId: 'tx-2' });
      expect((await repo.getPurchases('user-1')).length + (await repo.getPurchases('user-2')).length).toBe(2);
    });
  });

  describe('getSubscriptions', () => {
    it('returns empty array when no subscriptions', async () => {
      const result = await repo.getSubscriptions('user-1');
      expect(result).toEqual([]);
    });

    it('returns saved subscriptions', async () => {
      await repo.saveSubscription('user-1', mockSubscription);
      const result = await repo.getSubscriptions('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sub-1');
    });
  });

  describe('saveSubscription', () => {
    it('adds a new subscription', async () => {
      await repo.saveSubscription('user-1', mockSubscription);
      const subs = await repo.getSubscriptions('user-1');
      expect(subs).toHaveLength(1);
    });

    it('updates existing subscription by id', async () => {
      await repo.saveSubscription('user-1', mockSubscription);
      await repo.saveSubscription('user-1', { ...mockSubscription, status: 'cancelled' as const });
      const subs = await repo.getSubscriptions('user-1');
      expect(subs).toHaveLength(1);
      expect(subs[0].status).toBe('cancelled');
    });
  });

  describe('receipt cache', () => {
    it('caches and retrieves receipt', async () => {
      await repo.cacheReceipt('tx-1', 'receipt-data');
      const result = await repo.getCachedReceipt('tx-1');
      expect(result).toBe('receipt-data');
    });

    it('returns null for missing receipt', async () => {
      const result = await repo.getCachedReceipt('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('singleton export', () => {
    it('exports a singleton instance', () => {
      expect(purchaseRepository).toBeInstanceOf(PurchaseRepository);
    });
  });

  describe('PurchaseRepositoryError', () => {
    it('extends Error with correct name', () => {
      const err = new PurchaseRepositoryError('test error');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('PurchaseRepositoryError');
      expect(err.message).toBe('test error');
    });

    it('includes cause details', () => {
      const cause = new Error('original');
      const err = new PurchaseRepositoryError('wrapper', { cause });
      expect(err.details?.cause).toBe(cause);
    });
  });
});
