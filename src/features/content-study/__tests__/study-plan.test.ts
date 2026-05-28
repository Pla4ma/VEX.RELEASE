import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useContentReview, useStudyPlan } from "../hooks";

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

describe("useContentReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should fetch content data", async () => {
    const mockContent = {
      id: "content-123",
      source_type: "PASTE",
      status: "EXTRACTED",
      extracted_text: "Extracted text",
    };
    (service.fetchContentById as jest.Mock).mockResolvedValue(mockContent);
    const { result } = renderHook(() => useContentReview("content-123"), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.content).toEqual(mockContent);
    });
  });
  it("should track editing state", () => {
    const { result } = renderHook(() => useContentReview("content-123"), {
      wrapper,
    });
    expect(result.current.isEditing).toBe(false);
    act(() => {
      result.current.startEditing();
    });
    expect(result.current.isEditing).toBe(true);
    act(() => {
      result.current.cancelEditing();
    });
    expect(result.current.isEditing).toBe(false);
  });
  it("should update edited text", () => {
    const { result } = renderHook(() => useContentReview("content-123"), {
      wrapper,
    });
    act(() => {
      result.current.startEditing();
      result.current.setEditedText("New text");
    });
    expect(result.current.editedText).toBe("New text");
  });
  it("should calculate canGenerate based on content status", async () => {
    const mockContent = {
      id: "content-123",
      source_type: "PASTE",
      status: "EXTRACTED",
      extracted_text: "Extracted text",
    };
    (service.fetchContentById as jest.Mock).mockResolvedValue(mockContent);
    const { result } = renderHook(() => useContentReview("content-123"), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.canGenerate).toBe(true);
    });
  });
});

describe("useStudyPlan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should fetch generation data", async () => {
    const mockGeneration = {
      id: "gen-123",
      study_plan: {
        summary: { title: "Test Plan", keyPoints: ["Point 1"] },
        tasks: [],
        quiz: [],
      },
    };
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan("gen-123"), { wrapper });
    await waitFor(() => {
      expect(result.current.generation).toEqual(mockGeneration);
    });
  });
  it("should track completed tasks", async () => {
    const mockGeneration = {
      id: "gen-123",
      study_plan: {
        tasks: [
          { id: "task-1", content: "Task 1" },
          { id: "task-2", content: "Task 2" },
        ],
      },
    };
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan("gen-123"), { wrapper });
    await waitFor(() => {
      expect(result.current.completedTasks.size).toBe(0);
    });
    act(() => {
      result.current.completeTask("task-1");
    });
    expect(result.current.completedTasks.has("task-1")).toBe(true);
  });
  it("should track quiz answers", async () => {
    const mockGeneration = {
      id: "gen-123",
      study_plan: { quiz: [{ id: "quiz-1", question: "Q1" }] },
    };
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan("gen-123"), { wrapper });
    await waitFor(() => {
      act(() => {
        result.current.answerQuiz("quiz-1", "Answer", true);
      });
    });
    expect(result.current.quizAnswers["quiz-1"]).toEqual({
      answer: "Answer",
      isCorrect: true,
    });
  });
  it("should calculate progress", async () => {
    const mockGeneration = {
      id: "gen-123",
      study_plan: {
        tasks: [
          { id: "task-1", content: "Task 1" },
          { id: "task-2", content: "Task 2" },
          { id: "task-3", content: "Task 3" },
        ],
      },
    };
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan("gen-123"), { wrapper });
    await waitFor(() => {
      act(() => {
        result.current.completeTask("task-1");
        result.current.completeTask("task-2");
      });
    });
    expect(result.current.progress.taskProgress).toBe(2 / 3);
  });
});
