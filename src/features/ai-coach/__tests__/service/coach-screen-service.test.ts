import {
  askCoachQuestion,
  buildLocalCoachResponse,
  getCoachHistory,
} from '../../service/coach-screen-service';

jest.mock('../../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({})),
  isSupabaseConfigured: jest.fn(() => false),
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('../../repository/messages', () => ({
  fetchCoachHistory: jest.fn(),
}));
import { fetchCoachHistory } from '../../repository/messages';
jest.mock('../../../liveops-config', () => ({
  getAvailabilityFor: jest.fn(() => ({ canNavigate: true })),
}));

const supabaseConfig = jest.requireMock('../../../../config/supabase') as {
  isSupabaseConfigured: jest.Mock;
  supabase: {
    auth: {
      getSession: jest.Mock;
    };
    functions: {
      invoke: jest.Mock;
    };
  };
};

describe('coach screen service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    supabaseConfig.isSupabaseConfigured.mockReturnValue(false);
  });

  it('builds an actionable local coach response for dev sessions', () => {
    expect(buildLocalCoachResponse('Help me study this material')).toMatchObject({
      actionLabel: 'Start study',
      hasAction: true,
      actionData: { type: 'START_STUDY_SESSION' },
    });
  });

  it('does not present a canned reply when AI backend is unavailable', async () => {
    await expect(
      askCoachQuestion('I need to study', '00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow();
    expect(supabaseConfig.supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('uses AI backend message when configured', async () => {
    supabaseConfig.isSupabaseConfigured.mockReturnValue(true);
    supabaseConfig.supabase.functions.invoke.mockResolvedValue({
      data: {
        content: 'Start with one narrow target, then report back.',
        structuredData: {
          action: 'START_SESSION',
          actionLabel: 'Start focus',
          message: 'Start with one narrow target, then report back.',
        },
      },
      error: null,
    });

    const response = await askCoachQuestion(
      'Help me focus',
      '00000000-0000-4000-8000-000000000001',
    );

    expect(response.message).toBe(
      'Start with one narrow target, then report back.',
    );
    expect(response.actionData?.type).toBe('START_SESSION');
    expect(response.hasAction).toBe(true);
    expect(supabaseConfig.supabase.functions.invoke).toHaveBeenCalledWith(
      'ai-coach',
      expect.objectContaining({
        body: expect.objectContaining({
          requestType: 'GENERATE_COACH_MESSAGE',
          userId: '00000000-0000-4000-8000-000000000001',
        }),
      }),
    );
  });

  it('falls back when AI backend returns invalid action', async () => {
    supabaseConfig.isSupabaseConfigured.mockReturnValue(true);
    supabaseConfig.supabase.functions.invoke.mockResolvedValue({
      data: {
        action: { type: 'UNKNOWN_ACTION' },
        message: 'Backend text still works.',
      },
      error: null,
    });

    const response = await askCoachQuestion(
      'Anything',
      '00000000-0000-4000-8000-000000000001',
    );

    expect(response.message).toBe('Backend text still works.');
    expect(response.hasAction).toBe(false);
  });

  it('surfaces edge function status and body on non-2xx', async () => {
    supabaseConfig.isSupabaseConfigured.mockReturnValue(true);
    supabaseConfig.supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: {
        context: new Response(
          JSON.stringify({ error: { message: 'Missing LLM configuration' } }),
          { status: 500 },
        ),
      },
    });

    await expect(
      askCoachQuestion('Hello', 'local-user-id'),
    ).rejects.toThrow();
  });
  it('requires an authenticated user instead of using a canned reply', async () => {
    await expect(askCoachQuestion('Hello')).rejects.toThrow();
    expect(supabaseConfig.supabase.functions.invoke).not.toHaveBeenCalled();
  });
  it('returns only the authenticated user history through the repository', async () => {
    jest.mocked(fetchCoachHistory).mockResolvedValue({
      messages: [],
      mutedCategories: [],
    });

    await expect(getCoachHistory('11111111-1111-4111-8111-111111111111', 10)).resolves.toEqual({
      messages: [],
      mutedCategories: [],
    });
    expect(fetchCoachHistory).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      10,
    );
  });
});
