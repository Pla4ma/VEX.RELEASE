/**
 * expo-apple-authentication shim for dev environments where the native module
 * is unavailable or runtime bridge is not ready.
 */

'use strict';

import * as React from 'react';
import { Pressable } from 'react-native';

export const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
};

export const AppleAuthenticationUserDetectionStatus = {
  UNSUPPORTED: 0,
  UNKNOWN: 1,
  LIKELY_REAL: 2,
};

export const AppleAuthenticationCredentialState = {
  REVOKED: 0,
  AUTHORIZED: 1,
  NOT_FOUND: 2,
  TRANSFERRED: 3,
};

export const AppleAuthenticationButtonType = {
  SIGN_IN: 0,
  CONTINUE: 1,
  SIGN_UP: 2,
};

export const AppleAuthenticationButtonStyle = {
  WHITE: 0,
  WHITE_OUTLINE: 1,
  BLACK: 2,
};

export function AppleAuthenticationButton(
  props,
) {
  const { children, ...rest } = props ?? {};
  return React.createElement(Pressable, rest, children);
}

export function isAvailableAsync(): Promise<boolean> {
  return Promise.resolve(false);
}

export function signInAsync(): Promise<never> {
  return Promise.reject(new Error('Apple Authentication is unavailable in this runtime.'));
}

export function refreshAsync(): Promise<never> {
  return Promise.reject(new Error('Apple Authentication is unavailable in this runtime.'));
}

export function getCredentialStateAsync(): Promise<number> {
  return Promise.resolve(AppleAuthenticationCredentialState.NOT_FOUND);
}
