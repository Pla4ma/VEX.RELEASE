import {
  getStudyContentUploadRestriction,
  isStudyContentUploadUnlocked,
} from '../eligibility-policy';

describe('Study content upload policy', () => {
  it('keeps upload closed on Day 0, including for an explicit study goal', () => {
    expect(isStudyContentUploadUnlocked(0, 0, 'STUDY', 'study_focused')).toBe(
      false,
    );
  });

  it('unlocks after three completed sessions when study intent is explicit', () => {
    expect(isStudyContentUploadUnlocked(3, 0, 'STUDY', null)).toBe(true);
  });

  it('unlocks when study behavior reaches 35 percent', () => {
    expect(isStudyContentUploadUnlocked(20, 7, null, null)).toBe(true);
  });

  it('normalizes persisted goal and motivation casing like the server rule', () => {
    expect(isStudyContentUploadUnlocked(3, 0, 'study', 'STUDY_FOCUSED')).toBe(true);
  });

  it('does not unlock generic users on session count alone', () => {
    expect(isStudyContentUploadUnlocked(12, 2, 'WORK', 'worker')).toBe(false);
  });

  it('does not unlock on study behavior below the threshold', () => {
    expect(isStudyContentUploadUnlocked(20, 6, 'WORK', 'worker')).toBe(false);
  });

  it('clamps invalid counts instead of granting access', () => {
    expect(isStudyContentUploadUnlocked(0, 3, 'WORK', null)).toBe(false);
  });

  it('returns a study-path message while access is locked', () => {
    expect(getStudyContentUploadRestriction(0, 0, 'STUDY', null)).toContain(
      'focused blocks',
    );
    expect(getStudyContentUploadRestriction(0, 0, 'WORK', null)).toContain(
      'Choose a study goal',
    );
  });
});
