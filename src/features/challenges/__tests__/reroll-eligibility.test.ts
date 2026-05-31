import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as service from '../service';
import * as repository from '../repository';

jest.mock('../repository');

const mockedRepository = jest.mocked(repository);

describe('Challenges Service — checkRerollEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow free reroll within limit', async () => {
    mockedRepository.getFreeRerollCountToday.mockResolvedValue(0);
    const result = await service.checkRerollEligibility('user-1', 'c-1');
    expect(result.canReroll).toBe(true);
    expect(result.freeRerollAvailable).toBe(true);
  });

  it('should require paid reroll after free limit', async () => {
    mockedRepository.getFreeRerollCountToday.mockResolvedValue(1);
    const result = await service.checkRerollEligibility('user-1', 'c-1');
    expect(result.canReroll).toBe(true);
    expect(result.freeRerollAvailable).toBe(false);
    expect(result.gemCost).toBe(10);
  });
});
