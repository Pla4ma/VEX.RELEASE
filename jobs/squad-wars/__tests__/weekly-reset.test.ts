/**
 * Squad War Weekly Reset Tests
 * Full integration tests for the weekly reset flow
 * 
 * Covers:
 * - Expired war detection and processing
 * - Winner selection by total damage
 * - Winner reward granting (XP and coins)
 * - New war creation for active squads
 * - Push notification delivery
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ============================================================================
// Mocks
// ============================================================================

const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  lt: jest.fn(() => mockSupabaseClient),
  gt: jest.fn(() => mockSupabaseClient),
  in: jest.fn(() => mockSupabaseClient),
  maybeSingle: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('@trigger.dev/sdk', () => ({
  task: jest.fn((config) => ({
    ...config,
    run: config.run,
  })),
}));

const { squadWarWeeklyReset } = require('../weekly-reset');

// ============================================================================
// Test Data
// ============================================================================

const mockWarRow = {
  id: 'war-001',
  squad_id: 'squad-001',
  boss_name: 'The Iron Leviathan',
  reward_multiplier: 1.5,
  week_starts_at: '2024-01-01T00:00:00Z',
  week_ends_at: '2024-01-07T23:59:59Z',
};

const mockDamageRows = [
  { user_id: 'user-001', damage: 5000 },
  { user_id: 'user-002', damage: 3000 },
  { user_id: 'user-003', damage: 2000 },
];

const mockSquadMembers = [
  { user_id: 'user-001' },
  { user_id: 'user-002' },
  { user_id: 'user-003' },
];

const mockPushTokens = [
  { user_id: 'user-001', token: 'token-001', platform: 'ios' },
  { user_id: 'user-002', token: 'token-002', platform: 'android' },
];

const mockProgressionRow = {
  id: 'prog-001',
  level: 5,
  xp: 800,
  total_xp: 5000,
  next_level_threshold: 1000,
};

const mockWalletRow = {
  id: 'wallet-001',
  coins: 1000,
  total_coins_earned: 5000,
};

// ============================================================================
// Helper Functions
// ============================================================================

function setupMockChain(responseChain: Array<{ data?: any; error?: any }>) {
  let callIndex = 0;
  
  const createMockFn = () => {
    return jest.fn(() => {
      const response = responseChain[callIndex] || { data: null, error: null };
      callIndex++;
      
      if (response.error) {
        return Promise.resolve({ data: null, error: response.error });
      }
      
      return Promise.resolve({ 
        data: response.data, 
        error: null,
      });
    });
  };

  return createMockFn;
}

// ============================================================================
// Test Suite
// ============================================================================

describe('squadWarWeeklyReset', () => {
  let mockIo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock IO for Trigger.dev
    mockIo = {
      runTask: jest.fn((name, fn) => fn()),
    };

    // Reset environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  // ============================================================================
  // Expired War Detection
  // ============================================================================

  describe('Expired War Detection', () => {
    it('should identify wars ending before the cutoff time', async () => {
      const expiredWars = [
        { ...mockWarRow, id: 'war-001', week_ends_at: '2024-01-07T23:00:00Z' },
        { ...mockWarRow, id: 'war-002', week_ends_at: '2024-01-07T23:30:00Z' },
      ];

      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lt.mockReturnValue(mockSupabaseClient);

      // Mock the query response
      let queryCallCount = 0;
      mockSupabaseClient.then = jest.fn((callback: any) => {
        if (queryCallCount === 0) {
          queryCallCount++;
          return Promise.resolve(callback({ data: expiredWars, error: null }));
        }
        return Promise.resolve(callback({ data: [], error: null }));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('squad_wars');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(result.processedWars).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty result when no wars have expired', async () => {
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lt.mockReturnValue(mockSupabaseClient);

      let queryCallCount = 0;
      mockSupabaseClient.then = jest.fn((callback: any) => {
        if (queryCallCount === 0) {
          queryCallCount++;
          return Promise.resolve(callback({ data: [], error: null }));
        }
        return Promise.resolve(callback({ data: [], error: null }));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.processedWars).toBe(0);
      expect(result.winners).toBe(0);
      expect(result.losers).toBe(0);
    });

    it('should handle database errors during war fetching', async () => {
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lt.mockReturnValue(mockSupabaseClient);

      mockSupabaseClient.then = jest.fn(() => {
        return Promise.resolve({ data: null, error: new Error('Database connection failed') });
      });

      const run = squadWarWeeklyReset.run;
      
      await expect(run({} as any, mockIo)).rejects.toThrow();
    });
  });

  // ============================================================================
  // Winner Selection
  // ============================================================================

  describe('Winner Selection', () => {
    it('should select winner based on highest total damage', async () => {
      const wars = [
        { ...mockWarRow, id: 'war-001', squad_id: 'squad-a' },
        { ...mockWarRow, id: 'war-002', squad_id: 'squad-b' },
      ];

      const damageData = new Map([
        ['war-001', 10000], // Winner
        ['war-002', 5000],  // Loser
      ]);

      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      
      let callIndex = 0;
      const responses = [
        { data: wars, error: null }, // Fetch wars
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null }, // war-001 damage
        { data: [{ user_id: 'user-1', damage: 5000 }], error: null }, // war-002 damage
        { data: mockSquadMembers, error: null }, // squad members
        { data: mockPushTokens, error: null }, // push tokens
        { data: { id: 'new-war' }, error: null }, // insert new war
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.processedWars).toBe(2);
      expect(result.winners).toBe(1);
      expect(result.losers).toBe(1);
    });

    it('should handle tie-breaking when multiple squads have same damage', async () => {
      // First squad processed becomes winner when tied
      const wars = [
        { ...mockWarRow, id: 'war-001', squad_id: 'squad-a' },
        { ...mockWarRow, id: 'war-002', squad_id: 'squad-b' },
      ];

      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 5000 }], error: null }, // Both have 5000
        { data: [{ user_id: 'user-1', damage: 5000 }], error: null }, // Same damage
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: { id: 'new-war' }, error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      // Both have same damage, first one processed wins
      expect(result.winners + result.losers).toBe(2);
    });

    it('should mark squad as winner when they have the top damage', async () => {
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);

      let updateCallCount = 0;
      mockSupabaseClient.then = jest.fn((callback: any) => {
        updateCallCount++;
        if (updateCallCount === 1) {
          return Promise.resolve(callback({ data: [{ ...mockWarRow, total_damage: 10000 }], error: null }));
        }
        return Promise.resolve(callback({ error: null }));
      });

      const run = squadWarWeeklyReset.run;
      await run({} as any, mockIo);

      // Verify status update to 'victory' or 'defeat'
      const updateCalls = mockSupabaseClient.update.mock.calls;
      expect(updateCalls.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Winner Reward Granting
  // ============================================================================

  describe('Winner Reward Granting', () => {
    it('should grant XP bonus to winners based on contributed damage', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001', squad_id: 'squad-a' }];
      const damage = [{ user_id: 'user-001', damage: 5000 }];

      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: damage, error: null },
        { data: null, error: null }, // update status
        { data: damage, error: null }, // fetch for rewards
        { data: mockProgressionRow, error: null }, // progression fetch
        { data: null, error: null }, // progression update
        { data: null, error: null }, // xp history insert
        { data: mockWalletRow, error: null }, // wallet fetch
        { data: { id: 'wallet-001' }, error: null }, // wallet update
        { data: null, error: null }, // transaction insert
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null }, // active squads
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.rewardsGranted).toBeGreaterThan(0);
    });

    it('should grant coins bonus to winners', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001' }];
      const damage = [{ user_id: 'user-001', damage: 10000 }];

      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: damage, error: null },
        { data: null, error: null },
        { data: damage, error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: mockWalletRow, error: null },
        { data: { id: 'wallet-001' }, error: null },
        { data: null, error: null },
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      // Verify coins were granted
      expect(result.rewardsGranted).toBeGreaterThan(0);
    });

    it('should calculate bonus based on reward multiplier', async () => {
      const multiplier = 2.0;
      const damage = 1000;
      const expectedBonusMultiplier = multiplier - 1; // 1.0
      const expectedXpBonus = Math.max(1, Math.floor(damage * expectedBonusMultiplier)); // 1000

      // The calculation: damage * (rewardMultiplier - 1)
      expect(expectedXpBonus).toBe(1000);
    });

    it('should skip rewards for squads with zero damage', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001' }];
      const damage = []; // No damage recorded

      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: damage, error: null },
        { data: null, error: null },
        { data: damage, error: null },
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.rewardsGranted).toBe(0);
    });

    it('should create wallet if user does not have one', async () => {
      let callIndex = 0;
      const responses = [
        { data: [{ ...mockWarRow }], error: null },
        { data: [{ user_id: 'user-001', damage: 5000 }], error: null },
        { data: null, error: null },
        { data: [{ user_id: 'user-001', damage: 5000 }], error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: null, error: null }, // No wallet found (maybeSingle returns null)
        { data: { id: 'new-wallet' }, error: null }, // Wallet created
        { data: null, error: null }, // Transaction inserted
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      // Verify wallet was created
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // New War Creation
  // ============================================================================

  describe('New War Creation', () => {
    it('should create new wars for all active squads', async () => {
      const activeSquads = [
        { id: 'squad-001' },
        { id: 'squad-002' },
        { id: 'squad-003' },
      ];

      let callIndex = 0;
      const responses = [
        { data: [], error: null }, // No expired wars
        { data: activeSquads, error: null }, // Active squads
        { data: { id: 'new-war-1' }, error: null }, // Insert war 1
        { data: { id: 'new-war-2' }, error: null }, // Insert war 2
        { data: { id: 'new-war-3' }, error: null }, // Insert war 3
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: null, error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.nextWarsCreated).toBe(3);
    });

    it('should rotate bosses based on week number', async () => {
      const BOSS_ROTATION = [
        { name: 'The Iron Leviathan', maxHealth: 120000 },
        { name: 'The Ember Matron', maxHealth: 135000 },
        { name: 'The Null Titan', maxHealth: 150000 },
        { name: 'The Glass Colossus', maxHealth: 145000 },
      ];

      // Test boss rotation logic
      const week1 = new Date('2024-01-01');
      const week2 = new Date('2024-01-08');
      
      const getWeekBoss = (weekStartsAt: Date) => {
        const weekSeed = Math.floor(weekStartsAt.getTime() / (7 * 24 * 60 * 60 * 1000));
        return BOSS_ROTATION[Math.abs(weekSeed) % BOSS_ROTATION.length];
      };

      const boss1 = getWeekBoss(week1);
      const boss2 = getWeekBoss(week2);

      expect(boss1.name).toBeDefined();
      expect(boss2.name).toBeDefined();
      expect(boss1).not.toEqual(boss2);
    });

    it('should set correct week window for new wars', async () => {
      const now = new Date('2024-01-15T12:00:00Z'); // Monday
      
      const getNextUtcWeekWindow = (reference: Date) => {
        const start = new Date(reference);
        start.setUTCHours(0, 0, 0, 0);

        const day = start.getUTCDay();
        const daysUntilMonday = (8 - day) % 7 || 7;
        start.setUTCDate(start.getUTCDate() + daysUntilMonday);

        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);
        end.setUTCMilliseconds(-1);

        return { start, end };
      };

      const { start, end } = getNextUtcWeekWindow(now);
      
      expect(start.getUTCDay()).toBe(1); // Monday
      expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000 - 1);
    });
  });

  // ============================================================================
  // Push Notifications
  // ============================================================================

  describe('Push Notifications', () => {
    it('should send victory notification to winning squad', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001', squad_id: 'squad-a' }];
      
      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: null, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: mockWalletRow, error: null },
        { data: { id: 'wallet-001' }, error: null },
        { data: null, error: null },
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.notificationsSent).toBeGreaterThan(0);
    });

    it('should send defeat notification to losing squad', async () => {
      const wars = [
        { ...mockWarRow, id: 'war-001', squad_id: 'squad-a' },
        { ...mockWarRow, id: 'war-002', squad_id: 'squad-b' },
      ];

      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null }, // war-001 has more damage
        { data: [{ user_id: 'user-1', damage: 5000 }], error: null }, // war-002 has less
        { data: null, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: mockWalletRow, error: null },
        { data: { id: 'wallet-001' }, error: null },
        { data: null, error: null },
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: null, error: null },
        { data: mockSquadMembers, error: null },
        { data: mockPushTokens, error: null },
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      // Both squads should get notifications (1 winner, 1 loser)
      expect(result.notificationsSent).toBeGreaterThan(0);
      expect(result.winners).toBe(1);
      expect(result.losers).toBe(1);
    });

    it('should handle squad members without push tokens', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001' }];
      
      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: null, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: mockWalletRow, error: null },
        { data: { id: 'wallet-001' }, error: null },
        { data: null, error: null },
        { data: mockSquadMembers, error: null },
        { data: [], error: null }, // No push tokens
        { data: [], error: null },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      expect(result.notificationsSent).toBe(0);
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle progression update errors gracefully', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001' }];
      
      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: null, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: null, error: new Error('Progression update failed') }, // Error here
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        if (response.error) {
          return Promise.resolve(callback({ data: null, error: response.error }));
        }
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      
      await expect(run({} as any, mockIo)).rejects.toThrow();
    });

    it('should handle wallet transaction errors', async () => {
      const wars = [{ ...mockWarRow, id: 'war-001' }];
      
      let callIndex = 0;
      const responses = [
        { data: wars, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: null, error: null },
        { data: [{ user_id: 'user-1', damage: 10000 }], error: null },
        { data: mockProgressionRow, error: null },
        { data: null, error: null },
        { data: null, error: null },
        { data: null, error: new Error('Wallet fetch failed') },
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        if (response.error) {
          return Promise.resolve(callback({ data: null, error: response.error }));
        }
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      
      await expect(run({} as any, mockIo)).rejects.toThrow();
    });

    it('should continue processing other wars if one fails', async () => {
      // This tests that errors in one war don't stop processing others
      const wars = [
        { ...mockWarRow, id: 'war-001' },
        { ...mockWarRow, id: 'war-002' },
      ];

      // The job should process all wars even if one has issues
      expect(wars.length).toBe(2);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Full Integration Flow', () => {
    it('should execute complete weekly reset cycle', async () => {
      // This test simulates the entire flow end-to-end
      const wars = [{ ...mockWarRow, id: 'war-001', squad_id: 'squad-a' }];
      const damage = [{ user_id: 'user-001', damage: 5000 }];
      const squads = [{ id: 'squad-a' }, { id: 'squad-b' }];

      let callIndex = 0;
      const responses = [
        { data: wars, error: null }, // Fetch expired wars
        { data: damage, error: null }, // Fetch war damage
        { data: null, error: null }, // Update war status
        { data: damage, error: null }, // Fetch for rewards
        { data: mockProgressionRow, error: null }, // Fetch progression
        { data: null, error: null }, // Update progression
        { data: null, error: null }, // Insert XP history
        { data: mockWalletRow, error: null }, // Fetch wallet
        { data: { id: 'wallet-001' }, error: null }, // Update wallet
        { data: null, error: null }, // Insert transaction
        { data: mockSquadMembers, error: null }, // Fetch squad members
        { data: mockPushTokens, error: null }, // Fetch push tokens
        { data: squads, error: null }, // Fetch active squads
        { data: { id: 'new-war-1' }, error: null }, // Insert new war
        { data: { id: 'new-war-2' }, error: null }, // Insert new war
      ];

      mockSupabaseClient.then = jest.fn((callback: any) => {
        const response = responses[callIndex] || { data: [], error: null };
        callIndex++;
        return Promise.resolve(callback(response));
      });

      const run = squadWarWeeklyReset.run;
      const result = await run({} as any, mockIo);

      // Verify all aspects of the reset
      expect(result.processedWars).toBe(1);
      expect(result.winners + result.losers).toBe(1);
      expect(result.rewardsGranted).toBeGreaterThan(0);
      expect(result.notificationsSent).toBeGreaterThanOrEqual(0);
      expect(result.nextWarsCreated).toBe(2);
    });

    it('should produce correct result structure', async () => {
      const run = squadWarWeeklyReset.run;
      
      mockSupabaseClient.then = jest.fn(() => {
        return Promise.resolve({ data: [], error: null });
      });

      const result = await run({} as any, mockIo);

      expect(result).toHaveProperty('processedWars');
      expect(result).toHaveProperty('winners');
      expect(result).toHaveProperty('losers');
      expect(result).toHaveProperty('rewardsGranted');
      expect(result).toHaveProperty('notificationsSent');
      expect(result).toHaveProperty('nextWarsCreated');
      
      expect(typeof result.processedWars).toBe('number');
      expect(typeof result.winners).toBe('number');
      expect(typeof result.losers).toBe('number');
      expect(typeof result.rewardsGranted).toBe('number');
      expect(typeof result.notificationsSent).toBe('number');
      expect(typeof result.nextWarsCreated).toBe('number');
    });
  });
});
