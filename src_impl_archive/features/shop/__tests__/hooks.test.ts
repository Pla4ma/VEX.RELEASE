import {
  useActiveOffers,
  useInitiatePurchase,
  useShopItem,
  useShopItems,
} from '../hooks';

type QueryConfig = {
  enabled?: boolean;
  queryFn: () => Promise<unknown>;
  queryKey: readonly unknown[];
  staleTime?: number;
};

type MutationConfig = {
  mutationFn: (input: unknown) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
};

const mockUseQuery = jest.fn((config: QueryConfig) => ({
  ...config,
  data: undefined,
  error: null,
  isError: false,
  isPending: false,
  refetch: jest.fn(),
}));
const mockUseMutation = jest.fn((config: MutationConfig) => ({
  ...config,
  mutateAsync: config.mutationFn,
}));
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
};
const mockGetShopItems = jest.fn();
const mockGetItemsByType = jest.fn();
const mockGetItemDefinition = jest.fn();
const mockGetActiveOffers = jest.fn();
const mockInitiatePurchase = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (config: MutationConfig) => mockUseMutation(config),
  useQuery: (config: QueryConfig) => mockUseQuery(config),
  useQueryClient: () => mockQueryClient,
}));

jest.mock('../../items/service', () => ({
  getItemDefinition: (...args: unknown[]) => mockGetItemDefinition(...args),
  getItemsByType: (...args: unknown[]) => mockGetItemsByType(...args),
  getShopItems: (...args: unknown[]) => mockGetShopItems(...args),
}));

jest.mock('../../economy/service', () => ({
  getActiveOffers: (...args: unknown[]) => mockGetActiveOffers(...args),
  initiatePurchase: (...args: unknown[]) => mockInitiatePurchase(...args),
}));

const userId = '11111111-1111-4111-8111-111111111111';
const itemId = '22222222-2222-4222-8222-222222222222';
const purchaseId = '33333333-3333-4333-8333-333333333333';
const shopItem = { id: itemId, name: 'Focus Tonic', type: 'CONSUMABLE' };

describe('Shop hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires all-item queries to the item service', async () => {
    mockGetShopItems.mockResolvedValue([shopItem]);
    const result = useShopItems('ALL');

    await expect(result.queryFn()).resolves.toEqual([shopItem]);
    expect(result.queryKey).toEqual(['shop', 'items', 'ALL']);
    expect(mockGetShopItems).toHaveBeenCalledWith();
  });

  it('wires category queries to the typed item service', async () => {
    mockGetItemsByType.mockResolvedValue([shopItem]);
    const result = useShopItems('CONSUMABLE');

    await expect(result.queryFn()).resolves.toEqual([shopItem]);
    expect(mockGetItemsByType).toHaveBeenCalledWith({ includeUnavailable: false, type: 'CONSUMABLE' });
  });

  it('wires item detail queries with enabled state', async () => {
    mockGetItemDefinition.mockResolvedValue(shopItem);
    const result = useShopItem(itemId);

    await expect(result.queryFn()).resolves.toEqual(shopItem);
    expect(result.enabled).toBe(true);
    expect(mockGetItemDefinition).toHaveBeenCalledWith(itemId);
  });

  it('wires active offers to the economy service', async () => {
    mockGetActiveOffers.mockResolvedValue([]);
    const result = useActiveOffers(userId, 4);

    await expect(result.queryFn()).resolves.toEqual([]);
    expect(result.enabled).toBe(true);
    expect(mockGetActiveOffers).toHaveBeenCalledWith(4);
  });

  it('stores successful purchase results by purchase id', async () => {
    const purchaseResult = {
      error: null,
      inventoryItemIds: null,
      purchaseId,
      remainingBalance: { amount: 900, currency: 'COINS' },
      success: true,
    };
    mockInitiatePurchase.mockResolvedValue(purchaseResult);

    const mutation = useInitiatePurchase();
    await expect(mutation.mutateAsync({
      expectedPrice: { amount: 100, currency: 'COINS' },
      quantity: 1,
      shopItemId: itemId,
      userId,
    })).resolves.toEqual(purchaseResult);
    mutation.onSuccess?.(purchaseResult);

    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['shop', 'purchase', purchaseId], purchaseResult);
  });
});
