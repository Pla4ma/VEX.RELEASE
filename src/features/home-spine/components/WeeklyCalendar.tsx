import React, { useState, useCallback } from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { DayCell } from './DayCell';
import { DayDetailsPopover } from './DayDetailsPopover';
import type { WeeklyCalendarProps } from './weekly-calendar-types';

export type {
  WeeklyCalendarProps,
  DayData,
  DayStatus,
  EventType,
} from './weekly-calendar-types';

export function WeeklyCalendar({
  days,
  selectedDay,
  onDaySelect,
  currentStreak,
}: WeeklyCalendarProps): JSX.Element {
  const [showDetails, setShowDetails] = useState<Date | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const handleDayPress = useCallback(
    (day: Date) => {
      onDaySelect(day);
      setShowDetails(day);
    },
    [onDaySelect],
  );
  const selectedDayData = days.find(
    (d) => d.date.getTime() === showDetails?.getTime(),
  );
  return (
    <Box m="lg">
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="md"
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={20}>📅</Text>
          <Text variant="h4" color="text.primary">
            This Week
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>🔥</Text>
          <Text variant="body" color="accent.orange" fontWeight="600">
            {currentStreak} day streak
          </Text>
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="space-between">
        {days.map((day, index) => {
          const dateTime = day.date.getTime();
          const isSelected = selectedDay.getTime() === dateTime;
          const isToday = today.getTime() === dateTime;
          return (
            <DayCell
              key={dateTime}
              day={day}
              isSelected={isSelected}
              isToday={isToday}
              onPress={() => handleDayPress(day.date)}
              index={index}
            />
          );
        })}
      </Box>
      {selectedDayData && showDetails && (
        <Box mt="md">
          <DayDetailsPopover
            day={selectedDayData}
            onClose={() => setShowDetails(null)}
          />
        </Box>
      )}
    </Box>
  );
}
export default WeeklyCalendar;
