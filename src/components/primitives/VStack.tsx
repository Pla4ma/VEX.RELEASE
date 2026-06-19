/** Vertical stack with default spacing */
import React from 'react';
import { Stack } from './Stack';

export const VStack: React.FC<Omit<React.ComponentProps<typeof Stack>, 'direction'>> = (props) => (
  <Stack direction="column" {...props} />
);