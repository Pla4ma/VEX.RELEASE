/** Horizontal stack with default spacing */
import React from 'react';
import { Stack } from './Stack';

export const HStack: React.FC<Omit<React.ComponentProps<typeof Stack>, 'direction'>> = (props) => (
  <Stack direction="row" {...props} />
);