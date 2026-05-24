import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { HomeHeroCard } from '../HomeHeroCard';

jest.mock('../../../../theme', () => ({
  useTheme: () => ({
    theme: {
      borderRadius: { lg: 12, xl: 16 },
      colors: {
        background: { secondary: '#111111' },
        border: { light: '#333333' },
        primary: { 500: '#5b8cff', 600: '#3f6fff' },
        text: { inverse: '#ffffff', primary: '#ffffff', secondary: '#d0d0d0' },
      },
      spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
    },
  }),
}));

jest.mock('../../../../components/primitives/Button', () => ({
  Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
    const ReactRuntime = require('react');
    const { Pressable, Text } = require('react-native');
    return ReactRuntime.createElement(
      Pressable,
      { accessibilityRole: 'button', onPress },
      ReactRuntime.createElement(Text, null, children),
    );
  },
}));

jest.mock('../../../../components/primitives/Text', () => ({
  Text: ({ children }: { children: React.ReactNode }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    return ReactRuntime.createElement(Text, null, children);
  },
}));

describe('HomeHeroCard', () => {
  it('renders the selected priority copy with one primary CTA', () => {
    render(
      <HomeHeroCard
        isLoading={false}
        onPressPrimary={jest.fn()}
        priority={{
          cta: { action: 'OPEN_SESSION_SETUP', text: 'Keep Your Promise' },
          reason: 'Keep the thread alive with 20 focused minutes today.',
          type: 'COMPANION_PROMISE',
          urgency: 95,
        }}
        stakes={{
          atRisk: 'The promise thread goes quiet if you skip it.',
          potentialGain: 'You keep continuity between yesterday and today.',
          what: 'Companion promise',
        }}
      />,
    );

    expect(screen.getByText('Keep Your Promise')).toBeTruthy();
    expect(screen.getByText('Keep the thread alive with 20 focused minutes today.')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
