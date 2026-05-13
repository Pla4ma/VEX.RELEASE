import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Box } from "../components/primitives";
import { Text } from "../components/primitives";
import { Button } from "../components";
import { useTheme } from "../theme";
import { createDebugger } from "../utils/debug";
import { getAnalyticsService } from "../analytics/AnalyticsService";


export function setupGlobalErrorHandler(): void {
  // Handle JS errors
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    debug.error(isFatal ? 'Fatal Error' : 'Error', error);

    // Report to error tracking
    if (__DEV__) {
      debug.debug('Global Error Handler');
      debug.debug('Error: %s', error.message);
      debug.debug('Stack: %s', error.stack);
      debug.debug('Is Fatal: %s', String(isFatal));
    }

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export function setupRejectionHandler(): void {
  // Handle unhandled promise rejections
  // This is a no-op in React Native as it handles rejections differently
}