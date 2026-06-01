export const mockSelect = jest.fn();
export const mockEq = jest.fn();
export const mockGte = jest.fn();
export const mockLte = jest.fn();
export const mockOrder = jest.fn();
export const mockSingle = jest.fn();

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

export function setupChain(finalResult: { data: unknown; error: unknown }) {
  mockSelect.mockReturnValue({
    eq: mockEq.mockReturnValue({
      gte: mockGte.mockReturnValue({
        lte: mockLte.mockReturnValue({
          order: mockOrder.mockReturnValue({
            then: undefined,
            single: mockSingle,
          }),
          single: mockSingle,
        }),
      }),
    }),
  });

  mockOrder.mockReturnValue(Promise.resolve(finalResult));
  mockSingle.mockReturnValue(Promise.resolve(finalResult));
  mockLte.mockReturnValue(Promise.resolve(finalResult));
}
