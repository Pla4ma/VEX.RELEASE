export const Calendar = {
  requestCalendarPermissionsAsync: async () => ({ status: 'denied' as const }),
  getCalendarsAsync: async (_entityType: string) => [
    { id: 'default', allowsModifications: true },
  ],
  EntityTypes: { EVENT: 'event' },
  createEventAsync: async (_calendarId: string, _eventData: unknown) =>
    'event-id',
  updateEventAsync: async (
    _calendarId: string,
    _eventId: string,
    _eventData: unknown,
  ) => {},
  deleteEventAsync: async (_calendarId: string, _eventId: string) => {},
  getEventsAsync: async (
    _calendarIds: string[],
    _startDate: Date,
    _endDate: Date,
  ) => [],
};

export function mergeBusySlots(
  slots: Array<{ start: Date; end: Date }>,
): Array<{ start: Date; end: Date }> {
  if (slots.length === 0) {
    return [];
  }
  // slots[0] is safe after the length check above
  const merged: Array<{ start: Date; end: Date }> = [slots[0]!];
  for (let i = 1; i < slots.length; i++) {
    const last = merged[merged.length - 1]!; // always valid: merged starts with 1 element
    const current = slots[i]!; // always valid: i is in bounds per loop condition
    if (current.start <= last.end) {
      last.end = new Date(
        Math.max(last.end.getTime(), current.end.getTime()),
      );
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function calculateFreeSlots(
  busySlots: Array<{ start: Date; end: Date }>,
  timeMin: Date,
  timeMax: Date,
): Array<{ start: Date; end: Date; duration: number }> {
  const free: Array<{ start: Date; end: Date; duration: number }> = [];
  let currentTime = new Date(timeMin);
  for (const busy of busySlots) {
    if (currentTime < busy.start) {
      free.push({
        start: new Date(currentTime),
        end: new Date(busy.start),
        duration: Math.floor(
          (busy.start.getTime() - currentTime.getTime()) / 60000,
        ),
      });
    }
    currentTime = new Date(
      Math.max(currentTime.getTime(), busy.end.getTime()),
    );
  }
  if (currentTime < timeMax) {
    free.push({
      start: new Date(currentTime),
      end: new Date(timeMax),
      duration: Math.floor(
        (timeMax.getTime() - currentTime.getTime()) / 60000,
      ),
    });
  }
  return free.filter((slot) => slot.duration >= 15);
}
