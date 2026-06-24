'use strict';

import * as React from 'react';

const onlineState = {
  type: 'unknown',
  isConnected: true,
  isInternetReachable: true,
  details: null,
};

function addEventListener(listener) {
  listener?.(onlineState);
  return () => {};
}

function useNetInfo() {
  const [state] = React.useState(onlineState);
  return state;
}

const NetInfo = {
  addEventListener,
  fetch: async () => onlineState,
  refresh: async () => onlineState,
  configure: () => {},
  useNetInfo,
};

export { addEventListener, useNetInfo };
export default NetInfo;
