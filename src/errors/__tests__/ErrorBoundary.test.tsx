import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";

import { ErrorBoundary } from "../ErrorBoundary";
import type { ErrorCategory } from "../ErrorBoundary.types";
import {
  mockAnalytics,
  ThrowError,
  ThrowNetworkError,
  ThrowAuthError,
  ThrowClientError,
} from "./ErrorBoundary.test.helpers";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("Error Catching", () => {
    it("should catch errors in children", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );
      expect(getByText("Oops! Something went wrong")).toBeTruthy();
    });
    it("should render children when no error", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );
      expect(getByText("Normal render")).toBeTruthy();
    });
    it("should categorize network errors", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      expect(
        getByText("Connection lost. Check your internet and try again."),
      ).toBeTruthy();
    });
    it("should categorize auth errors", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowAuthError />
        </ErrorBoundary>,
      );
      expect(getByText("Session expired. Please sign in again.")).toBeTruthy();
    });
    it("should categorize client errors", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowClientError />
        </ErrorBoundary>,
      );
      expect(
        getByText("An unexpected error occurred. Please restart the app."),
      ).toBeTruthy();
    });
  });

  describe("Analytics Integration", () => {
    it("should track errors", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        "error",
        expect.objectContaining({
          error: "Test error",
          category: expect.any(String),
        }),
      );
    });
    it("should mark client errors as fatal", () => {
      render(
        <ErrorBoundary>
          <ThrowClientError />
        </ErrorBoundary>,
      );
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        "error",
        expect.objectContaining({ fatal: true }),
      );
    });
  });

  describe("Custom Fallback", () => {
    it("should render custom fallback when provided", () => {
      const fallback = <div>Custom error UI</div>;
      const { getByText } = render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );
      expect(getByText("Custom error UI")).toBeTruthy();
    });
  });

  describe("Error Handler Callback", () => {
    it("should call onError with error details", () => {
      const onError = jest.fn();
      render(
        <ErrorBoundary onError={onError}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Network request failed" }),
        expect.objectContaining({ componentStack: expect.any(String) }),
        "network" as ErrorCategory,
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple errors", () => {
      const { getByText, rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );
      expect(getByText("Oops! Something went wrong")).toBeTruthy();
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );
      expect(getByText("Normal render")).toBeTruthy();
    });
    it("should cleanup timers on unmount", () => {
      jest.useFakeTimers();
      const { unmount } = render(
        <ErrorBoundary retryDelay={5000}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      unmount();
      jest.advanceTimersByTime(5000);
      jest.useRealTimers();
    });
    it("should handle error with null message", () => {
      const ThrowNullError = () => {
        const error = new Error("");
        throw error;
      };
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowNullError />
        </ErrorBoundary>,
      );
      expect(getByText("Something went wrong")).toBeTruthy();
    });
  });
});
