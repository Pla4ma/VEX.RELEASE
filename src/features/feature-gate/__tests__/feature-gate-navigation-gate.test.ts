// ── Mocks ──────────────────────────────────────────────────────────

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

// Mock theme
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: { background: { primary: '#000' }, text: { primary: '#fff', secondary: '#aaa' } },
      spacing: { 4: 16 },
    },
  }),
}));

// Mock primitives
jest.mock('../../../components/primitives/Box', () => ({
  Box: 'View',
}));
jest.mock('../../../components/primitives/Text', () => ({
  Text: 'Text',
}));
jest.mock('../../../components/primitives/Button', () => ({
  Button: 'Button',
}));

jest.mock('../../../theme/tokens/sizing', () => ({
  sizing: { width: { xl: 400 }, icon: { '2xl': 32 } },
}));

// ── Imports after mocks ────────────────────────────────────────────

import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationGate } from '../NavigationGate';

// ── NavigationGate ─────────────────────────────────────────────────

describe('NavigationGate component', () => {
  it('renders the feature not available message', () => {
    const { getByText } = render(
      React.createElement(NavigationGate, {
        featureName: 'Duels',
        featureReason: 'currently disabled',
      }),
    );
    expect(getByText('Feature Not Available')).toBeTruthy();
    expect(getByText(/Duels is currently disabled/)).toBeTruthy();
  });

  it('renders default suggested action button', () => {
    const tree = render(
      React.createElement(NavigationGate, {
        featureName: 'Duels',
        featureReason: 'archived',
      }),
    );
    // The default action is "Return to Home"
    const json = tree.toJSON();
    const treeStr = JSON.stringify(json);
    expect(treeStr).toContain('Return to Home');
  });

  it('renders custom suggested action', () => {
    const tree = render(
      React.createElement(NavigationGate, {
        featureName: 'Duels',
        featureReason: 'archived',
        suggestedAction: 'Go Back',
      }),
    );
    const treeStr = JSON.stringify(tree.toJSON());
    expect(treeStr).toContain('Go Back');
  });
});
