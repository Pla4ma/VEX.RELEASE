import React from "react";
import type { StateWrapperProps } from "./types";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { SuccessState } from "./success-state";

export function StateWrapper({
  isLoading,
  isError,
  error,
  isEmpty,
  isSuccess,
  loadingProps,
  emptyProps,
  errorProps,
  successProps,
  children,
  testID,
}: StateWrapperProps): JSX.Element {
  if (isLoading) {
    return <LoadingState {...loadingProps} testID={`${testID}-loading`} />;
  }
  if (isError && error) {
    return (
      <ErrorState error={error} {...errorProps} testID={`${testID}-error`} />
    );
  }
  if (isEmpty) {
    return emptyProps?.title ? (
      <EmptyState {...emptyProps} testID={`${testID}-empty`} />
    ) : (
      <>{children}</>
    );
  }
  if (isSuccess && successProps) {
    return <SuccessState {...successProps} testID={`${testID}-success`} />;
  }
  return <>{children}</>;
}
