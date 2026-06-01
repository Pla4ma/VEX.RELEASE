/**
 * Shared mock setup for reward-ledger repository tests.
 * Both sub-test files import mock functions from here so they
 * share a single jest.mock for supabase.
 */
export const mockSingle = jest.fn();
export const mockSelect = jest.fn();
export const mockEq = jest.fn();
export const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));
