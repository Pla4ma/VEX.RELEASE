import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PremiumGate, type PremiumGateFeature } from '../PremiumGate';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../../../components/primitives/Text', () => {
  const React = require('react');
  const { Text: RNText } = require('react-native');
  return {
    Text: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement(RNText, { style }, children),
  };
});

jest.mock('../../../../components/primitives/Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) =>
      React.createElement(Pressable, { onPress }, React.createElement(Text, null, children)),
  };
});

jest.mock('../../../../icons/components/Icon', () => ({
  Icon: () => null,
}));

jest.mock('../../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { secondary: '#F8FAFC', tertiary: '#F1F5F9' },
        border: { DEFAULT: '#CBD5E1' },
        text: { primary: '#0F172A', secondary: '#475569', tertiary: '#64748B' },
        primary: { 500: '#6366F1' },
        success: { 500: '#22C55E' },
      },
    },
  }),
}));

jest.mock('@/shared/ui/create-sheet', () => ({
  createSheet: (styles: Record<string, unknown>) => styles,
}));

describe('PremiumGate', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderPremiumGate = (
    feature: PremiumGateFeature,
    props: Partial<Parameters<typeof PremiumGate>[0]> = {},
  ) => {
    return render(
      <PremiumGate
        feature={feature}
        onClose={jest.fn()}
        showCloseButton={true}
        {...props}
      />,
    );
  };

  describe('current premium pillars', () => {
    it('renders deep_coach_memory gate', () => {
      const { getByText } = renderPremiumGate('deep_coach_memory');
      expect(getByText('Unlock Deep Coach Memory')).toBeTruthy();
      expect(getByText(/VEX learns your patterns/)).toBeTruthy();
      expect(getByText('See Premium')).toBeTruthy();
    });

    it('renders progress_intelligence gate', () => {
      const { getByText } = renderPremiumGate('progress_intelligence');
      expect(getByText('Unlock Progress Intelligence')).toBeTruthy();
      expect(getByText(/See your rhythm/)).toBeTruthy();
    });

    it('renders advanced_study_os gate', () => {
      const { getByText } = renderPremiumGate('advanced_study_os');
      expect(getByText('Unlock Advanced Study / Deep Work')).toBeTruthy();
      expect(getByText(/Turn sessions into review/)).toBeTruthy();
    });

    it('renders premium_session_modes gate', () => {
      const { getByText, getAllByText } = renderPremiumGate('premium_session_modes');
      expect(getByText('Unlock Premium Session Modes')).toBeTruthy();
      expect(getAllByText(/Exam Sprint/).length).toBeGreaterThan(0);
    });

    it('renders visual_identity gate', () => {
      const { getByText } = renderPremiumGate('visual_identity');
      expect(getByText('Unlock Visual Identity')).toBeTruthy();
      expect(getByText(/Shape companion/)).toBeTruthy();
    });

    it('renders recovery_planning gate', () => {
      const { getByText } = renderPremiumGate('recovery_planning');
      expect(getByText('Unlock Recovery Planning')).toBeTruthy();
      expect(getByText(/Build a recovery plan/)).toBeTruthy();
    });
  });

  describe('public v1 premium language', () => {
    it('has no shop/inventory/squad/raid/battle pass language', () => {
      const { queryByText } = renderPremiumGate('deep_coach_memory');
      expect(queryByText(/inventory/i)).toBeNull();
      expect(queryByText(/squad/i)).toBeNull();
      expect(queryByText(/raid/i)).toBeNull();
      expect(queryByText(/battle pass/i)).toBeNull();
      expect(queryByText(/boss tier/i)).toBeNull();
      expect(queryByText(/drill sergeant/i)).toBeNull();
      expect(queryByText(/final boss/i)).toBeNull();
    });
  });

  describe('navigation', () => {
    it('navigates to Paywall on upgrade press', () => {
      const { getByText } = renderPremiumGate('deep_coach_memory');
      fireEvent.press(getByText('See Premium'));
      expect(mockNavigate).toHaveBeenCalledWith('Paywall', {
        source: 'feature_gate',
        gatedFeature: 'deep_coach_memory',
      });
    });
  });

  describe('close button', () => {
    it('shows maybe later when onClose and showCloseButton', () => {
      const { getByText } = renderPremiumGate('deep_coach_memory', {
        onClose: jest.fn(),
        showCloseButton: true,
      });
      expect(getByText('Maybe later')).toBeTruthy();
    });

    it('hides maybe later when showCloseButton is false', () => {
      const { queryByText } = renderPremiumGate('deep_coach_memory', {
        onClose: jest.fn(),
        showCloseButton: false,
      });
      expect(queryByText('Maybe later')).toBeNull();
    });
  });

  describe('custom description', () => {
    it('uses custom description when provided', () => {
      const { getByText } = renderPremiumGate('deep_coach_memory', {
        description: 'Custom gate text',
      });
      expect(getByText('Custom gate text')).toBeTruthy();
    });
  });
});
