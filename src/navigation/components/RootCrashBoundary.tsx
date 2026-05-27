import React, { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";

interface CrashColors {
  background: string;
  border: string;
  primary: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

interface RootCrashBoundaryProps {
  children: ReactNode;
  colors: CrashColors;
  resetKey: string;
}

interface RootCrashBoundaryState {
  error: Error | null;
  resetKey: string;
}

export class RootCrashBoundary extends Component<
  RootCrashBoundaryProps,
  RootCrashBoundaryState
> {
  state: RootCrashBoundaryState = {
    error: null,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(
    error: Error,
  ): Partial<RootCrashBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: RootCrashBoundaryProps,
    state: RootCrashBoundaryState,
  ): Partial<RootCrashBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error): void {
    Sentry.captureException(error, {
      tags: { feature: "navigation", operation: "root-render" },
    });
  }

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }
    const { colors } = this.props;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            gap: 14,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            backgroundColor: colors.surface,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: "800",
            }}
          >
            VEX hit a startup snag
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Your account is safe. Restart this screen after the app finishes
            syncing your new profile.
          </Text>
          <Pressable
            accessibilityHint="Retries rendering the app shell"
            accessibilityLabel="Retry app startup"
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            style={{
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: colors.background,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
