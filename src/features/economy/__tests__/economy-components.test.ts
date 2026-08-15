import React from 'react';
import { SimpleWalletBadge } from '../components/SimpleWalletBadge';
import { StreakInsuranceCard } from '../components/StreakInsuranceCard';
import { render, fireEvent } from '@testing-library/react-native';

describe('SimpleWalletBadge', () => {
  it("shows 'Day N' when streak > 0", async () => {
    const { getByText } = await render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 5,
        onPress: jest.fn(),
      }),
    );
    expect(getByText('Day 5')).toBeTruthy();
  });

  it("shows 'Start' when streak is 0", async () => {
    const { getByText } = await render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 0,
        onPress: jest.fn(),
      }),
    );
    expect(getByText('Start')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 3,
        onPress,
      }),
    );
    await fireEvent.press(getByLabelText('Progress badge'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility properties', async () => {
    const { getByLabelText } = await render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 1,
        onPress: jest.fn(),
      }),
    );
    const badge = getByLabelText('Progress badge');
    expect(badge.props.accessibilityRole).toBe('button');
  });
});

describe('StreakInsuranceCard', () => {
  it('shows insured status with days remaining', async () => {
    const { getByText } = await render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: true, daysRemaining: 7 },
      }),
    );
    expect(getByText(/Protected for 7 days/i)).toBeTruthy();
  });

  it('shows available message when not insured', async () => {
    const { getByText } = await render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: false, daysRemaining: 0 },
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it('shows available message when status is null', async () => {
    const { getByText } = await render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it('has accessibility label', async () => {
    const { getByLabelText } = await render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByLabelText('Streak protection status')).toBeTruthy();
  });
});
