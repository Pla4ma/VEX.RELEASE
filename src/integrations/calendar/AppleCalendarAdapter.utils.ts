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
