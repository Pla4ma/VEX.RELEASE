/** Horizontal stack with default spacing */
import React from 'react';
import { Stack } from './Stack';

export const HStack: React.ComponentType<Omit<React.ComponentProps<typeof Stack>, 'direction'>> = (props) => (
  <Stack direction="row" {...props} />
);