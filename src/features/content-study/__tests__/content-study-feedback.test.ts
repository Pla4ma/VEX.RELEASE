import { submitFeedback, buildContentStudyTimeoutFallback } from '../service';
import { CONTENT_STUDY_API } from '../constants';
import { feedbackResponseSchema, ContentStudyTimeoutFallbackSchema, invokeAndParse } from '../api-schemas';

jest.mock('../api-schemas', () => ({
  ...jest.requireActual('../api-schemas'),
  invokeAndParse: jest.fn(),
}));

describe('submitFeedback', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits feedback via invokeAndParse', async () => {
    jest.mocked(invokeAndParse).mockResolvedValue({ success: true, feedbackId: 'fb-1' });
    const result = await submitFeedback({ contentId: 'c-1', rating: 5, comment: 'Great' });
    expect(jest.mocked(invokeAndParse)).toHaveBeenCalledWith(
      CONTENT_STUDY_API.ENDPOINTS.FEEDBACK, feedbackResponseSchema, { contentId: 'c-1', rating: 5, comment: 'Great' },
    );
    expect(result).toEqual({ success: true, feedbackId: 'fb-1' });
  });

  it('propagates errors from invokeAndParse', async () => {
    jest.mocked(invokeAndParse).mockRejectedValue(new Error('Network error'));
    await expect(submitFeedback({ contentId: 'c-1', rating: 1 })).rejects.toThrow('Network error');
  });
});

describe('buildContentStudyTimeoutFallback', () => {
  it('returns valid timeout fallback', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(() => ContentStudyTimeoutFallbackSchema.parse(fallback)).not.toThrow();
  });

  it('includes study session CTA', () => {
    expect(buildContentStudyTimeoutFallback().ctaLabel).toBe('Start study session');
  });

  it('includes warming up title', () => {
    expect(buildContentStudyTimeoutFallback().title).toBe('Content generation is still warming up');
  });
});
