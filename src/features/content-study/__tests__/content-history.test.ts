import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useContentHistory, useRateLimit } from "../hooks";

jest.mock("../../store", () => ({
  useAuthStore: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
  }),
}));

jest.mock("../ContentStudyService", () => ({
  submitContent: jest.fn(),
  extractContent: jest.fn(),
  generateStudyPlan: jest.fn(),
  getContentStatus: jest.fn(),
  uploadStudyFile: jest.fn(),
  updateContentText: jest.fn(),
  fetchContentById: jest.fn(),
  fetchGenerationById: jest.fn(),
  pollContentStatus: jest.fn(),
  fetchContentHistory: jest.fn(),
  checkRateLimit: jest.fn(),
}));
import * as service from "../ContentStudyService";

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
};

describe("useContentHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should fetch content history", async () => {
    const mockHistory = [
      { id: "content-1", source_type: "PASTE" },
      { id: "content-2", source_type: "YOUTUBE" },
    ];
    (service.fetchContentHistory as jest.Mock).mockResolvedValue(mockHistory);
    const { result } = renderHook(() => useContentHistory(), { wrapper });
    await waitFor(() => {
      expect(result.current.content).toEqual(mockHistory);
    });
  });
  it("should refresh history", async () => {
    const mockHistory = [{ id: "content-1", source_type: "PASTE" }];
    (service.fetchContentHistory as jest.Mock).mockResolvedValue(mockHistory);
    const { result } = renderHook(() => useContentHistory(), { wrapper });
    await waitFor(() => {
      expect(result.current.content).toBeDefined();
    });
    await act(async () => {
      await result.current.refresh();
    });
    expect(service.fetchContentHistory).toHaveBeenCalledTimes(2);
  });
});

describe("useRateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should check rate limit", async () => {
    const mockRateLimit = {
      canGenerate: true,
      remaining: 8,
      resetsAt: Date.now() + 3600000,
    };
    (service.checkRateLimit as jest.Mock).mockResolvedValue(mockRateLimit);
    const { result } = renderHook(() => useRateLimit(), { wrapper });
    await waitFor(() => {
      expect(result.current.rateLimit).toEqual(mockRateLimit);
    });
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBeNull();
  });
  it("should handle rate limit errors", async () => {
    (service.checkRateLimit as jest.Mock).mockRejectedValue(
      new Error("Rate limit check failed"),
    );
    const { result } = renderHook(() => useRateLimit(), { wrapper });
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.isChecking).toBe(false);
  });
});
