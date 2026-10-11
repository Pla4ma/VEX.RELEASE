/**
 * Tests for boss components
 * Covers: BossBattleHUD
 */

import React from 'react';
import { BossBattleHUD } from '../components/boss-battle-hud';
import { render } from '@testing-library/react-native';

describe('BossBattleHUD', () => {
  it('renders the day-one momentum message', async () => {
    const { getByText } = await render(React.createElement(BossBattleHUD));
    expect(getByText(/Momentum encounters are now part of your focus loop/i)).toBeTruthy();
  });

  it('has accessibility label', async () => {
    const { getByLabelText } = await render(React.createElement(BossBattleHUD));
    expect(getByLabelText('Boss battle')).toBeTruthy();
  });
});
