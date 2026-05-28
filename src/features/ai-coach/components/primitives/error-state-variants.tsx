import React from "react";
import { ErrorState } from "./error-state";

export function NetworkErrorState({
  onRetry,
}: {
  onRetry?: () => Promise<void>;
}) {
  return (
    <ErrorState
      title="Connection Lost"
      message="Unable to connect to the server. Please check your internet connection and try again."
      errorCode="NETWORK_ERROR"
      onRetry={onRetry}
    />
  );
}

export function TimeoutErrorState({
  onRetry,
}: {
  onRetry?: () => Promise<void>;
}) {
  return (
    <ErrorState
      title="Request Timed Out"
      message="The server is taking too long to respond. This might be due to high traffic or a slow connection."
      errorCode="TIMEOUT"
      onRetry={onRetry}
    />
  );
}

export function ServerErrorState({
  onRetry,
}: {
  onRetry?: () => Promise<void>;
}) {
  return (
    <ErrorState
      title="Server Error"
      message="We're experiencing technical difficulties. Our team has been notified and is working on a fix."
      errorCode="SERVER_ERROR"
      onRetry={onRetry}
    />
  );
}

export function ValidationErrorState({
  field,
  onDismiss,
}: {
  field?: string;
  onDismiss?: () => void;
}) {
  return (
    <ErrorState
      title="Invalid Input"
      message={
        field
          ? `Please check the ${field} field and try again.`
          : "Some of the information provided doesn't look right. Please review and try again."
      }
      errorCode="VALIDATION_ERROR"
      onDismiss={onDismiss}
    />
  );
}

export function NotFoundErrorState({
  resource = "item",
  onDismiss,
}: {
  resource?: string;
  onDismiss?: () => void;
}) {
  return (
    <ErrorState
      title="Not Found"
      message={`The ${resource} you're looking for doesn't exist or has been removed.`}
      errorCode="NOT_FOUND"
      onDismiss={onDismiss}
    />
  );
}

export function PermissionErrorState({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to access this feature. Please check your account settings."
      errorCode="FORBIDDEN"
      onDismiss={onDismiss}
    />
  );
}

export function RateLimitErrorState({ retryAfter }: { retryAfter?: number }) {
  return (
    <ErrorState
      title="Too Many Requests"
      message={`You've made too many requests. Please wait ${retryAfter ? `${retryAfter} seconds` : "a moment"} before trying again.`}
      errorCode="RATE_LIMIT"
    />
  );
}
