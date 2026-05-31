import { NudgeSignalRecordSchema } from './helpers';

describe('notification policy — signal recording', () => {
  it('validates sent signal', () => {
    const signal = {
      userId: 'abc',
      nudgeType: 'gentle_return',
      signal: 'sent',
      lane: 'student',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates opened signal', () => {
    const signal = {
      userId: 'def',
      nudgeType: 'rescue',
      signal: 'opened',
      lane: 'minimal_normal',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates dismissed signal', () => {
    const signal = {
      userId: 'ghi',
      nudgeType: 'study_deadline',
      signal: 'dismissed',
      lane: 'student',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates ignored signal', () => {
    const signal = {
      userId: 'jkl',
      nudgeType: 'project_resume',
      signal: 'ignored',
      lane: 'deep_creative',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates rescue_started signal', () => {
    const signal = {
      userId: 'mno',
      nudgeType: 'rescue',
      signal: 'rescue_started',
      lane: 'minimal_normal',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('validates session_completed signal', () => {
    const signal = {
      userId: 'pqr',
      nudgeType: 'gentle_return',
      signal: 'session_completed',
      lane: 'game_like',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).not.toThrow();
  });

  it('rejects invalid signal type', () => {
    const signal = {
      userId: 'stu',
      nudgeType: 'none',
      signal: 'clicked',
      lane: 'student',
      occurredAt: Date.now(),
    };
    expect(() => NudgeSignalRecordSchema.parse(signal)).toThrow();
  });
});
