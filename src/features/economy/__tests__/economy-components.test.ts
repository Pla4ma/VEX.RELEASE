import React from 'react';
import { SimpleWalletBadge } from '../components/SimpleWalletBadge';
import { StreakInsuranceCard } from '../components/StreakInsuranceCard';
import { render, fireEvent } from '@testing-library/react-native';

describe('SimpleWalletBadge', () => {
  it("shows 'Day N' when streak > 0", () => {
    const { getByText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 5,
        onPress: jest.fn(),
      }),
    );
    expect(getByText('Day 5')).toBeTruthy();
  });

  it("shows 'Start' when streak is 0", () => {
    const { getByText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 0,
        onPress: jest.fn(),
      }),
    );
    expect(getByText('Start')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      React.createElement(SimpleWalletBadge, {
        userId: 'u1',
        streak: 3,
        onPress,
      }),
    );
    fireEvent.press(getByLabelText('Progress badge'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
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
  it('shows insured status with days remaining', () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: true, daysRemaining: 7 },
      }),
    );
    expect(getByText(/Protected for 7 days/i)).toBeTruthy();
  });

  it('shows available message when not insured', () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: { isInsured: false, daysRemaining: 0 },
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it('shows available message when status is null', () => {
    const { getByText } = render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByText(/Streak protection available/i)).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(
      React.createElement(StreakInsuranceCard, {
        status: null,
      }),
    );
    expect(getByLabelText('Streak protection status')).toBeTruthy();
  });
});
