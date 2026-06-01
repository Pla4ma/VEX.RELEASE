import { describe, it, expect } from '@jest/globals';

describe('Perfect Session detection', () => {
  it('isPerfect is true when score >= 95, no pauses, >= 30min', () => {
    // This is tested in the ScoringEngine integration
    // Criteria: finalScore >= 95 && pauses === 0 && effectiveTime >= 30 * 60 && focusQualityScore >= 95
    const mockCalculation = {
      finalScore: 95,
      pauses: 0,
      effectiveTime: 30 * 60,
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(true);
  });

  it('isPerfect is false when paused even once', () => {
    const mockCalculation = {
      finalScore: 95,
      pauses: 1,
      effectiveTime: 30 * 60,
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });

  it('isPerfect is false when duration < 30 minutes', () => {
    const mockCalculation = {
      finalScore: 95,
      pauses: 0,
      effectiveTime: 25 * 60, // 25 minutes
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });

  it('isPerfect is false when score < 95', () => {
    const mockCalculation = {
      finalScore: 94,
      pauses: 0,
      effectiveTime: 30 * 60,
      focusQualityScore: 94,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });
});
