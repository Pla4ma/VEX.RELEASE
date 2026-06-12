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

  it('propagates errors', async () => {
    jest.mocked(invokeAndParse).mockRejectedValue(new Error('fail'));
    await expect(submitFeedback({ contentId: 'c-1', rating: 1 })).rejects.toThrow('fail');
  });
});

describe('buildContentStudyTimeoutFallback', () => {
  it('returns valid fallback', () => {
    expect(() => ContentStudyTimeoutFallbackSchema.parse(buildContentStudyTimeoutFallback())).not.toThrow();
  });
  it('includes study CTA', () => {
    expect(buildContentStudyTimeoutFallback().ctaLabel).toBe('Start study session');
  });
  it('includes warming title', () => {
    expect(buildContentStudyTimeoutFallback().title).toBe('Content generation is still warming up');
  });
});
