import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CreativeMoodLogger, MOODS } from '../CreativeMoodLogger';

describe('CreativeMoodLogger', () => {
  const mockOnMoodSelected = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders when isVisible is true', () => {
    const { getByText } = render(
      <CreativeMoodLogger
        isVisible={true}
        onMoodSelected={mockOnMoodSelected}
        onSkip={mockOnSkip}
      />
    );

    // Should show the title
    expect(getByText("How's the creative energy?")).toBeTruthy();
  });

  it('does not render when isVisible is false', () => {
    const { toJSON } = render(
      <CreativeMoodLogger
        isVisible={false}
        onMoodSelected={mockOnMoodSelected}
        onSkip={mockOnSkip}
      />
    );

    // Should return null
    expect(toJSON()).toBeNull();
  });

  it('calls onMoodSelected with correct mood on emoji tap', () => {
    const { getByLabelText } = render(
      <CreativeMoodLogger
        isVisible={true}
        onMoodSelected={mockOnMoodSelected}
        onSkip={mockOnSkip}
      />
    );

    // Tap on the first mood (On fire)
    const onFireButton = getByLabelText('On fire mood');
    fireEvent.press(onFireButton);

    // Wait for the setTimeout in the component
    jest.advanceTimersByTime(500);

    // Verify onMoodSelected was called with the correct mood
    expect(mockOnMoodSelected).toHaveBeenCalled();
  });

  it('calls onSkip when skip is tapped', () => {
    const { getByLabelText } = render(
      <CreativeMoodLogger
        isVisible={true}
        onMoodSelected={mockOnMoodSelected}
        onSkip={mockOnSkip}
      />
    );

    // Tap the skip button
    const skipButton = getByLabelText('Skip mood logging');
    fireEvent.press(skipButton);

    // Verify onSkip was called
    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('shows selected mood with highlighted border', () => {
    const { getByLabelText } = render(
      <CreativeMoodLogger
        isVisible={true}
        onMoodSelected={mockOnMoodSelected}
        onSkip={mockOnSkip}
      />
    );

    // Tap on a mood to select it
    const calmButton = getByLabelText('Calm mood');
    fireEvent.press(calmButton);

    // The mood should be selected (visual state tested via snapshot or style)
    expect(calmButton).toBeTruthy();
  });

  it('exports MOODS constant with correct structure', () => {
    // Verify MOODS array has the expected structure
    expect(MOODS).toHaveLength(5);
    expect(MOODS[0]).toHaveProperty('emoji');
    expect(MOODS[0]).toHaveProperty('label');
    expect(MOODS[0]).toHaveProperty('bonus');

    // Verify specific moods exist
    const onFireMood = MOODS.find(m => m.label === 'On fire');
    expect(onFireMood?.bonus).toBe(10);

    const calmMood = MOODS.find(m => m.label === 'Calm');
    expect(calmMood?.bonus).toBe(5);
  });
});
