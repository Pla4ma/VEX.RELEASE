import { formatTime } from "../components/report-content-helpers";

describe("formatTime", () => {
  it("formats seconds-only as minutes", () => {
    expect(formatTime(600)).toBe("10m");
  });

  it("formats hours and minutes", () => {
    expect(formatTime(3600)).toBe("1h 0m");
    expect(formatTime(3661)).toBe("1h 1m");
  });

  it("formats zero as 0m", () => {
    expect(formatTime(0)).toBe("0m");
  });

  it("formats large values correctly", () => {
    expect(formatTime(7200)).toBe("2h 0m");
    expect(formatTime(5400)).toBe("1h 30m");
  });

  it("formats sub-minute values", () => {
    expect(formatTime(30)).toBe("0m");
    expect(formatTime(59)).toBe("0m");
  });
});
