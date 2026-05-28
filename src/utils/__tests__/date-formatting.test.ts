import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  formatRelativeTime,
  formatDistanceToNow,
  formatDate,
  formatTime,
  formatDateTime,
} from "../date";

describe("formatRelativeTime / formatDistanceToNow", () => {
  let now: Date;
  beforeEach(() => {
    now = new Date("2024-06-15T12:00:00Z");
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('returns "just now" for dates less than 60 seconds ago', () => {
    const recent = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(recent)).toBe("just now");
  });
  it("returns minutes ago for dates 1-59 minutes ago", () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });
  it("returns hours ago for dates 1-23 hours ago", () => {
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });
  it("returns days ago for dates 1-6 days ago", () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });
  it("returns weeks ago for dates 7-29 days ago", () => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoWeeksAgo)).toBe("2w ago");
  });
  it("returns formatted date for dates 30+ days ago", () => {
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(fortyDaysAgo);
    expect(result).not.toMatch(/ago$/);
    expect(result.length).toBeGreaterThan(0);
  });
  it("formatDistanceToNow is the same as formatRelativeTime", () => {
    const recent = new Date(now.getTime() - 30 * 1000);
    expect(formatDistanceToNow(recent)).toBe(formatRelativeTime(recent));
  });
  it("accepts a timestamp number", () => {
    const tsMs = now.getTime() - 10 * 1000;
    expect(formatRelativeTime(tsMs)).toBe("just now");
  });
  it("accepts an ISO string", () => {
    const isoStr = new Date(now.getTime() - 3 * 60 * 1000).toISOString();
    expect(formatRelativeTime(isoStr)).toBe("3m ago");
  });
});

describe("formatDate", () => {
  const testDate = new Date("2024-06-15T12:00:00Z");
  it("formats in short format", () => {
    const result = formatDate(testDate, "short");
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/15/);
  });
  it("formats in medium format (default)", () => {
    const result = formatDate(testDate, "medium");
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/2024/);
  });
  it("formats in long format", () => {
    const result = formatDate(testDate, "long");
    expect(result).toMatch(/June/i);
    expect(result).toMatch(/2024/);
  });
  it("formats in full format", () => {
    const result = formatDate(testDate, "full");
    expect(result).toMatch(/Saturday/i);
    expect(result).toMatch(/June/i);
    expect(result).toMatch(/2024/);
  });
  it("uses medium as default format", () => {
    const withDefault = formatDate(testDate);
    const withMedium = formatDate(testDate, "medium");
    expect(withDefault).toBe(withMedium);
  });
  it("accepts a timestamp number", () => {
    const result = formatDate(testDate.getTime(), "short");
    expect(result).toMatch(/Jun/i);
  });
  it("accepts an ISO string", () => {
    const result = formatDate(testDate.toISOString(), "short");
    expect(result).toMatch(/Jun/i);
  });
});

describe("formatTime", () => {
  const testDate = new Date("2024-06-15T14:30:00Z");
  it("formats in short format", () => {
    const result = formatTime(testDate, "short");
    expect(result).toMatch(/:/);
  });
  it("formats in medium format", () => {
    const result = formatTime(testDate, "medium");
    expect(result).toMatch(/:/);
  });
  it("defaults to short format", () => {
    const withDefault = formatTime(testDate);
    const withShort = formatTime(testDate, "short");
    expect(withDefault).toBe(withShort);
  });
});

describe("formatDateTime", () => {
  const testDate = new Date("2024-06-15T14:30:00Z");
  it("includes both date and time", () => {
    const result = formatDateTime(testDate);
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/:/);
    expect(result).toContain(" at ");
  });
  it("uses short format", () => {
    const result = formatDateTime(testDate, "short");
    expect(result).toMatch(/Jun/i);
  });
  it("uses medium as default format", () => {
    const withDefault = formatDateTime(testDate);
    const withMedium = formatDateTime(testDate, "medium");
    expect(withDefault).toBe(withMedium);
  });
});
