/**
 * vaul shim for React Native
 *
 * @expo/ui imports { Drawer } from 'vaul' unconditionally in its universal
 * BottomSheet component. vaul is a React DOM drawer that depends on
 * @radix-ui/react-dialog → react-remove-scroll → aria-hidden → etc.
 * These packages access browser globals (document, window) at module init
 * time, which don't exist in React Native's JS runtime, causing:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides a no-op Drawer object with the same component shape
 * that @expo/ui expects, so the import resolves without pulling in any
 * web-only dependencies.
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

const NoopDrawerPart = React.forwardRef((props, ref) => {
  const { children, style, ...rest } = props ?? {};
  return React.createElement(View, { ref, style, ...rest }, children);
});

const Drawer = Object.assign(NoopDrawerPart, {
  Root: NoopDrawerPart,
  Portal: NoopDrawerPart,
  Content: NoopDrawerPart,
  Overlay: NoopDrawerPart,
  Title: NoopDrawerPart,
  Handle: NoopDrawerPart,
});

export { Drawer };
