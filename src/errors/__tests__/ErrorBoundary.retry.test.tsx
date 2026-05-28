import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";

import { ErrorBoundary } from "../ErrorBoundary";
import {
  ThrowError,
  ThrowNetworkError,
  ThrowClientError,
} from "./ErrorBoundary.test.helpers";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("Retry Logic", () => {
    it("should show retry button for recoverable errors", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      expect(getByText("Try Again")).toBeTruthy();
    });
    it("should not show retry for client errors", () => {
      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowClientError />
        </ErrorBoundary>,
      );
      expect(queryByText("Try Again")).toBeNull();
    });
    it("should call onRetry when retry button pressed", () => {
      const onReset = jest.fn();
      const { getByText } = render(
        <ErrorBoundary onReset={onReset}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      fireEvent.press(getByText("Try Again"));
      expect(onReset).toHaveBeenCalled();
    });
    it("should track retry count", () => {
      const { getByText } = render(
        <ErrorBoundary maxRetries={3}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      fireEvent.press(getByText("Try Again"));
      expect(getByText("Retry attempt 1 of 3")).toBeTruthy();
    });
    it("should show loading state during retry", async () => {
      const onReset = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      const { getByText, queryByText } = render(
        <ErrorBoundary onReset={onReset}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      fireEvent.press(getByText("Try Again"));
      await waitFor(() => {
        expect(queryByText("Retrying...")).toBeTruthy();
      });
    });
  });

  describe("Degraded Mode", () => {
    it("should show degraded mode option", () => {
      const { getByText } = render(
        <ErrorBoundary allowDegraded={true}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      expect(getByText("Continue Anyway")).toBeTruthy();
    });
    it("should enter degraded mode on continue", () => {
      const { getByText, queryByText } = render(
        <ErrorBoundary allowDegraded={true}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      fireEvent.press(getByText("Continue Anyway"));
      expect(getByText("Running in limited mode")).toBeTruthy();
      expect(queryByText("Oops! Something went wrong")).toBeNull();
    });
    it("should render degraded fallback when provided", () => {
      const degradedFallback = <div>Custom degraded UI</div>;
      const { getByText } = render(
        <ErrorBoundary allowDegraded={true} degradedFallback={degradedFallback}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      fireEvent.press(getByText("Continue Anyway"));
      expect(getByText("Custom degraded UI")).toBeTruthy();
    });
    it("should not show degraded mode for non-recoverable errors", () => {
      const { queryByText } = render(
        <ErrorBoundary allowDegraded={true}>
          <ThrowClientError />
        </ErrorBoundary>,
      );
      expect(queryByText("Continue Anyway")).toBeNull();
    });
  });

  describe("Auto-Retry", () => {
    it("should auto-retry network errors", async () => {
      jest.useFakeTimers();
      const onReset = jest.fn().mockResolvedValue(undefined);
      render(
        <ErrorBoundary onReset={onReset} retryDelay={1000}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(onReset).toHaveBeenCalled();
      });
      jest.useRealTimers();
    });
    it("should not auto-retry client errors", async () => {
      jest.useFakeTimers();
      const onReset = jest.fn();
      render(
        <ErrorBoundary onReset={onReset} retryDelay={1000}>
          <ThrowClientError />
        </ErrorBoundary>,
      );
      jest.advanceTimersByTime(5000);
      expect(onReset).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
    it("should stop retrying after max retries", async () => {
      jest.useFakeTimers();
      const onReset = jest.fn().mockRejectedValue(new Error("Retry failed"));
      const { getByText } = render(
        <ErrorBoundary onReset={onReset} maxRetries={2} retryDelay={100}>
          <ThrowNetworkError />
        </ErrorBoundary>,
      );
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(getByText("Retry attempt 1 of 2")).toBeTruthy();
      });
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(getByText("Retry attempt 2 of 2")).toBeTruthy();
      });
      jest.advanceTimersByTime(400);
      jest.useRealTimers();
    });
  });
});
