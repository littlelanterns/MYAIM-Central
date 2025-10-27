/**
 * Event Types
 * Type definitions for calendar events system
 */

// Event from database
export interface CalendarEventDB {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  is_all_day: boolean;
  event_type: 'task' | 'event' | 'deadline' | 'reminder';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  source: 'family' | 'google' | 'mindsweep';
  external_id?: string;
  is_recurring: boolean;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  recurrence_days?: number[]; // [0,1,2,3,4,5,6] where 0=Sunday
  recurrence_count?: number;
  created_by: string;
  family_id: string;
  created_at: string;
  updated_at: string;
}

// Event for UI (with Date objects)
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  type: 'task' | 'event' | 'deadline' | 'reminder';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  source?: 'family' | 'google' | 'mindsweep';
  externalId?: string;
  isRecurring?: boolean;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrenceInterval?: number;
  recurrenceEndDate?: Date;
  recurrenceDays?: number[];
  recurrenceCount?: number;
  createdBy?: string;
  familyId?: string;
}

// Event input for creation
export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  type: 'task' | 'event' | 'deadline' | 'reminder';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  isRecurring?: boolean;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrenceInterval?: number;
  recurrenceEndDate?: Date;
  recurrenceDays?: number[];
  recurrenceCount?: number;
  attendeeIds?: string[]; // Family member IDs to invite
}

// Event attendee
export interface EventAttendee {
  id: string;
  event_id: string;
  family_member_id: string;
  can_edit: boolean;
  can_view: boolean;
  rsvp_status?: 'pending' | 'accepted' | 'declined' | 'tentative';
  added_at: string;
}

// Convert DB event to UI event
export function dbEventToUIEvent(dbEvent: CalendarEventDB): CalendarEvent {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    location: dbEvent.location,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    isAllDay: dbEvent.is_all_day,
    type: dbEvent.event_type,
    category: dbEvent.category,
    priority: dbEvent.priority,
    color: dbEvent.color,
    source: dbEvent.source,
    externalId: dbEvent.external_id,
    isRecurring: dbEvent.is_recurring,
    recurrenceType: dbEvent.recurrence_type,
    recurrenceInterval: dbEvent.recurrence_interval,
    recurrenceEndDate: dbEvent.recurrence_end_date ? new Date(dbEvent.recurrence_end_date) : undefined,
    recurrenceDays: dbEvent.recurrence_days,
    recurrenceCount: dbEvent.recurrence_count,
    createdBy: dbEvent.created_by,
    familyId: dbEvent.family_id
  };
}
