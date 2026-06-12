/**
 * Content Study Service — submitFeedback and Timeout Fallback Tests
 */

import {
  submitFeedback,
  buildContentStudyTimeoutFallback,
} from '../service';
import { CONTENT_STUDY_API, ERROR_MESSAGES } from '../constants';
import {
  feedbackResponseSchema,
  ContentStudyTimeoutFallbackSchema,
} from '../api-schemas';
import { invokeAndParse } from '../api-schemas';

jest.mock('../api-schemas', () => ({
  ...jest.requireActual('../api-schemas'),
  invokeAndParse: jest.fn(),
}));

const mockedInvokeAndParse = jest.mocked(invokeAndParse);

describe('submitFeedback', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits feedback via invokeAndParse', async () => {
    const mockResponse = { success: true, feedbackId: 'fb-1' };
    mockedInvokeAndParse.mockResolvedValue(mockResponse);

    const result = await submitFeedback({
      contentId: 'content-1',
      rating: 5,
      comment: 'Great material',
    });

    expect(mockedInvokeAndParse).toHaveBeenCalledWith(
      CONTENT_STUDY_API.ENDPOINTS.FEEDBACK,
      feedbackResponseSchema,
      { contentId: 'content-1', rating: 5, comment: 'Great material' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('passes request through without transformation', async () => {
    const request = { contentId: 'c-1', rating: 3 };
    mockedInvokeAndParse.mockResolvedValue({ success: true });

    await submitFeedback(request as any);

    expect(mockedInvokeAndParse).toHaveBeenCalledWith(
      CONTENT_STUDY_API.ENDPOINTS.FEEDBACK,
      feedbackResponseSchema,
      request,
    );
  });

  it('propagates errors from invokeAndParse', async () => {
    mockedInvokeAndParse.mockRejectedValue(new Error('Network error'));

    await expect(
      submitFeedback({ contentId: 'c-1', rating: 1 } as any),
    ).rejects.toThrow('Network error');
  });

  it('handles empty comment', async () => {
    mockedInvokeAndParse.mockResolvedValue({ success: true });

    await submitFeedback({ contentId: 'c-1', rating: 4, comment: '' });

    expect(mockedInvokeAndParse).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ comment: '' }),
    );
  });
});

describe('buildContentStudyTimeoutFallback', () => {
  it('returns valid timeout fallback', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(() => ContentStudyTimeoutFallbackSchema.parse(fallback)).not.toThrow();
  });

  it('includes study session CTA', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(fallback.ctaLabel).toBe('Start study session');
  });

  it('includes warming up title', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(fallback.title).toBe('Content generation is still warming up');
  });

  it('includes recovery instructions in body', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(fallback.body).toContain('retry');
    expect(fallback.body).toContain('service health recovers');
  });
});
