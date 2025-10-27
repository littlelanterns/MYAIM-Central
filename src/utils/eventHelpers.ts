/**
 * Event Helpers
 * Utility functions for working with calendar events
 */

import { CreateEventInput } from '../types/events.types';

/**
 * Convert EventCreationModal form data to CreateEventInput format
 */
export function convertModalDataToEventInput(eventData: any): CreateEventInput {
  // Parse recurrence data
  let recurrenceType: any = 'none';
  let recurrenceInterval = 1;
  let recurrenceDays: number[] | undefined;
  let recurrenceEndDate: Date | undefined;
  let recurrenceCount: number | undefined;

  if (eventData.recurrence === 'daily') recurrenceType = 'daily';
  else if (eventData.recurrence === 'weekly') recurrenceType = 'weekly';
  else if (eventData.recurrence === 'monthly') recurrenceType = 'monthly';
  else if (eventData.recurrence === 'yearly') recurrenceType = 'yearly';
  else if (eventData.recurrence === 'custom' && eventData.customRecurrence) {
    recurrenceType = 'custom';
    recurrenceInterval = eventData.customRecurrence.interval || 1;

    // Convert day names to numbers (Sun=0, Mon=1, etc.)
    if (eventData.customRecurrence.daysOfWeek && eventData.customRecurrence.daysOfWeek.length > 0) {
      const dayMap: { [key: string]: number } = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
      };
      recurrenceDays = eventData.customRecurrence.daysOfWeek.map((d: string) => dayMap[d]);
    }

    if (eventData.customRecurrence.endType === 'on' && eventData.customRecurrence.endOnDate) {
      recurrenceEndDate = new Date(eventData.customRecurrence.endOnDate);
    } else if (eventData.customRecurrence.endType === 'after') {
      recurrenceCount = eventData.customRecurrence.endAfter;
    }
  }

  // Create start and end Date objects
  const startDateTime = eventData.allDay
    ? new Date(eventData.startDate)
    : new Date(`${eventData.startDate}T${eventData.startTime}`);

  const endDateTime = eventData.allDay
    ? new Date(eventData.endDate || eventData.startDate)
    : new Date(`${eventData.endDate || eventData.startDate}T${eventData.endTime || eventData.startTime}`);

  return {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start: startDateTime,
    end: endDateTime,
    isAllDay: eventData.allDay,
    type: 'event',
    isRecurring: eventData.recurrence !== 'one-time',
    recurrenceType,
    recurrenceInterval,
    recurrenceDays,
    recurrenceEndDate,
    recurrenceCount,
    attendeeIds: eventData.attendees
  };
}
