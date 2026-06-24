'use strict';

import * as React from 'react';

export function createNativeStackNavigator() {
  const Navigator = ({ children }) => React.createElement(React.Fragment, null, children);
  const Screen = () => null;
  const Group = ({ children }) => React.createElement(React.Fragment, null, children);
  return { Navigator, Screen, Group };
}
