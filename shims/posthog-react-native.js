/**
 * posthog-react-native shim for Expo Go
 *
 * PostHog uses native modules (like device info) that may not be available
 * or may crash synchronously in Expo Go.
 * This provides a no-op shim for development previews.
 */

'use strict';

import * as React from 'react';

const noop = () => {};
const noopAsync = async () => {};

class PostHog {
  constructor(apiKey, options) {
    this.apiKey = apiKey;
    this.options = options;
  }
  
  setup = noopAsync;
  capture = noop;
  identify = noop;
  alias = noop;
  screen = noop;
  group = noop;
  optIn = noop;
  optOut = noop;
  reset = noop;
  hasOptedIn = () => false;
  hasOptedOut = () => true;
  getFeatureFlag = () => undefined;
  getFeatureFlagPayload = () => undefined;
  onFeatureFlags = noop;
  reloadFeatureFlags = noopAsync;
  isFeatureEnabled = () => false;
  getDistinctId = () => 'anonymous-expo-go-user';
  flush = noopAsync;
  close = noopAsync;
}

const PostHogProvider = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

const usePostHog = () => new PostHog('dummy', {});

export {
  PostHog,
  PostHogProvider,
  usePostHog,
};
