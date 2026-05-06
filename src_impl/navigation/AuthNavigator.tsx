/**
 * Auth Navigator
 *
 * Stack navigator for authentication screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParams } from './types';

const Stack = createNativeStackNavigator<AuthStackParams>();

/**
 * Auth navigator component
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        getComponent={() => require('../screens/auth/LoginScreen').LoginScreen}
      />
      <Stack.Screen
        name="Register"
        getComponent={() => require('../screens/auth/RegisterScreen').RegisterScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        getComponent={() => require('../screens/auth/ForgotPasswordScreen').ForgotPasswordScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        getComponent={() => require('../screens/auth/ResetPasswordScreen').ResetPasswordScreen}
      />
      <Stack.Screen
        name="VerifyEmail"
        getComponent={() => require('../screens/auth/VerifyEmailScreen').VerifyEmailScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
