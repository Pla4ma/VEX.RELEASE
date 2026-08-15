/**
 * Tests for rewards components
 * Covers: RewardChest
 */

import { RewardChest } from '../components/reward-chest';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('RewardChest', () => {
  it('renders the archived message', async () => {
    const { getByText } = await render(React.createElement(RewardChest));
    expect(
      getByText(/Chest and economy rewards have been moved/i),
    ).toBeTruthy();
  });

  it('has accessibility label', async () => {
    const { getByLabelText } = await render(React.createElement(RewardChest));
    expect(getByLabelText('Reward chest')).toBeTruthy();
  });
});
