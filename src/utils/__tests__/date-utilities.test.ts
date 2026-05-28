import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  isToday,
  isYesterday,
  addDays,
  startOfDay,
  endOfDay,
  parseISO,
  toISO,
} from "../date";

describe("isToday", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it("returns true for today", () => {
    expect(isToday(new Date("2024-06-15T08:00:00Z"))).toBe(true);
  });
  it("returns false for yesterday", () => {
    expect(isToday(new Date("2024-06-14T12:00:00Z"))).toBe(false);
  });
  it("returns false for tomorrow", () => {
    expect(isToday(new Date("2024-06-16T12:00:00Z"))).toBe(false);
  });
  it("accepts a timestamp", () => {
    const todayTs = new Date("2024-06-15T10:00:00Z").getTime();
    expect(isToday(todayTs)).toBe(true);
  });
});

describe("isYesterday", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it("returns true for yesterday", () => {
    expect(isYesterday(new Date("2024-06-14T08:00:00Z"))).toBe(true);
  });
  it("returns false for today", () => {
    expect(isYesterday(new Date("2024-06-15T12:00:00Z"))).toBe(false);
  });
  it("returns false for two days ago", () => {
    expect(isYesterday(new Date("2024-06-13T12:00:00Z"))).toBe(false);
  });
});

describe("addDays", () => {
  it("adds positive days", () => {
    const base = new Date("2024-06-15");
    const result = addDays(base, 5);
    expect(result.getDate()).toBe(20);
  });
  it("subtracts days when negative", () => {
    const base = new Date("2024-06-15");
    const result = addDays(base, -3);
    expect(result.getDate()).toBe(12);
  });
  it("does not mutate the original date", () => {
    const base = new Date("2024-06-15");
    addDays(base, 5);
    expect(base.getDate()).toBe(15);
  });
  it("handles month boundaries", () => {
    const base = new Date("2024-06-30");
    const result = addDays(base, 2);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(2);
  });
});

describe("startOfDay", () => {
  it("sets time to midnight", () => {
    const date = new Date("2024-06-15T14:30:45.123");
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
  it("preserves the date", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });
  it("does not mutate the original date", () => {
    const date = new Date("2024-06-15T14:30:00");
    startOfDay(date);
    expect(date.getHours()).toBe(14);
  });
});

describe("endOfDay", () => {
  it("sets time to 23:59:59.999", () => {
    const date = new Date("2024-06-15T08:00:00");
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it("preserves the date", () => {
    const date = new Date("2024-06-15T08:00:00");
    const result = endOfDay(date);
    expect(result.getDate()).toBe(15);
  });
  it("does not mutate the original date", () => {
    const date = new Date("2024-06-15T08:00:00");
    endOfDay(date);
    expect(date.getHours()).toBe(8);
  });
});

describe("parseISO", () => {
  it("parses a valid ISO string to a Date", () => {
    const result = parseISO("2024-06-15T12:00:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });
  it("returns an invalid Date for malformed string", () => {
    const result = parseISO("not-a-date");
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe("toISO", () => {
  it("converts a Date to an ISO string", () => {
    const date = new Date("2024-06-15T12:00:00.000Z");
    expect(toISO(date)).toBe("2024-06-15T12:00:00.000Z");
  });
  it("round-trips with parseISO", () => {
    const original = new Date("2024-06-15T12:00:00.000Z");
    const iso = toISO(original);
    const roundTripped = parseISO(iso);
    expect(roundTripped.getTime()).toBe(original.getTime());
  });
});
