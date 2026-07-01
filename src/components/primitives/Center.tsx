/** Centered content stack */
import React from 'react';
import { Stack } from './Stack';

export const Center: React.ComponentType<Omit<React.ComponentProps<typeof Stack>, 'align' | 'justify'>> = (
  props,
) => <Stack align="center" justify="center" flex={1} {...props} />;