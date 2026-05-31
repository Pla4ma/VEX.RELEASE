export const TEST_USER_ID = 'test-user-123';

export function createMockStorage() {
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  };
}

export function createCompanionProfile(
  overrides?: Record<string, unknown>,
) {
  return {
    id: `companion_${TEST_USER_ID}`,
    name: 'Vexling',
    type: 'focus_wisp',
    mood: 'happy',
    level: 1,
    xp: 0,
    lastFedAt: Date.now(),
    lastPettedAt: null,
    specialAbilityCharge: 0,
    equippedItems: [],
    unlockedAbilities: [],
    ...overrides,
  };
}
