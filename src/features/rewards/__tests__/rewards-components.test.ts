/**
 * Tests for rewards components
 * Covers: RewardChest
 */

import { RewardChest } from '../components/reward-chest';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('RewardChest', () => {
  it('renders the archived message', () => {
    const { getByText } = render(React.createElement(RewardChest));
    expect(
      getByText(/Chest and economy rewards have been moved/i),
    ).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(React.createElement(RewardChest));
    expect(getByLabelText('Reward chest')).toBeTruthy();
  });
});
