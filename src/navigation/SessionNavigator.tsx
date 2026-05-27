/**
 * Session Navigator
 *
 * Core Focus Loop navigation stack.
 * Manages the complete session flow: Setup → Active → Complete.
 */

import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { initializeSessionRuntime } from "../app/bootstrap";
import type { SessionStackParams } from "./types";

const Stack = createNativeStackNavigator<SessionStackParams>();

/**
 * Session navigator - Core Focus Loop
 */
export const SessionNavigator: React.FC = () => {
  useEffect(() => {
    initializeSessionRuntime();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="SessionSetup"
        getComponent={() =>
          require("../screens/session/SessionSetupScreen").SessionSetupScreen
        }
      />
      <Stack.Screen
        name="ActiveSession"
        getComponent={() =>
          require("../screens/session/ActiveSessionScreen").ActiveSessionScreen
        }
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="SessionComplete"
        getComponent={() =>
          require("../screens/session/SessionCompleteScreen")
            .SessionCompleteScreen
        }
      />
      <Stack.Screen
        name="SessionHistory"
        getComponent={() =>
          require("../screens/session/SessionHistoryScreen")
            .SessionHistoryScreen
        }
      />
    </Stack.Navigator>
  );
};

export default SessionNavigator;
