import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export function useQuietHours(): {
  quietHours: QuietHours;
  handleQuietHoursToggle: () => void;
  handleSetQuietHours: (type: 'start' | 'end') => void;
} {
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });

  const handleQuietHoursToggle = useCallback(() => {
    setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const updateQuietTime = (type: 'start' | 'end', time: string) => {
    setQuietHours((prev) => ({ ...prev, [type]: time }));
  };

  const handleSetQuietHours = useCallback((type: 'start' | 'end') => {
    Alert.alert(
      `Set ${type === 'start' ? 'Start' : 'End'} Time`,
      'Choose a time',
      [
        { text: '20:00', onPress: () => updateQuietTime(type, '20:00') },
        { text: '21:00', onPress: () => updateQuietTime(type, '21:00') },
        { text: '22:00', onPress: () => updateQuietTime(type, '22:00') },
        { text: '23:00', onPress: () => updateQuietTime(type, '23:00') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  return { quietHours, handleQuietHoursToggle, handleSetQuietHours };
}
