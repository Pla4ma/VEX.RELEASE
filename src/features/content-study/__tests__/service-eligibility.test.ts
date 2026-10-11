import { getContentStudyEligibility } from '../service-eligibility';
import { fetchContentStudyEligibility } from '../repository';

jest.mock('../repository', () => ({
  fetchContentStudyEligibility: jest.fn(),
}));

const fetchEligibilityMock = jest.mocked(fetchContentStudyEligibility);

describe('getContentStudyEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates and returns the server access response', async () => {
    fetchEligibilityMock.mockResolvedValue({
      success: true,
      canUpload: false,
      fallbackLabel: 'Start with a study target.',
    });

    await expect(getContentStudyEligibility()).resolves.toEqual({
      success: true,
      canUpload: false,
      fallbackLabel: 'Start with a study target.',
    });
  });

  it('rejects malformed access responses', async () => {
    fetchEligibilityMock.mockResolvedValue({ success: true, canUpload: 'yes' });

    await expect(getContentStudyEligibility()).rejects.toThrow();
  });

  it('propagates repository failures so the UI can offer retry', async () => {
    fetchEligibilityMock.mockRejectedValue(new Error('network unavailable'));

    await expect(getContentStudyEligibility()).rejects.toThrow(
      'network unavailable',
    );
  });
});
