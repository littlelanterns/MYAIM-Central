/**
 * Events Service
 * Handles all calendar event database operations
 */

import { supabase } from '../lib/supabase';
import {
  CalendarEvent,
  CalendarEventDB,
  CreateEventInput,
  EventAttendee,
  dbEventToUIEvent
} from '../types/events.types';

export class EventsService {
  /**
   * Create a new calendar event
   */
  static async createEvent(
    input: CreateEventInput,
    createdBy: string,
    familyId: string
  ): Promise<CalendarEvent | null> {
    try {
      // Insert event
      const { data: event, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          title: input.title,
          description: input.description,
          location: input.location,
          start_time: input.start.toISOString(),
          end_time: input.end.toISOString(),
          is_all_day: input.isAllDay,
          event_type: input.type,
          category: input.category,
          priority: input.priority,
          color: input.color,
          source: 'family',
          is_recurring: input.isRecurring || false,
          recurrence_type: input.recurrenceType || 'none',
          recurrence_interval: input.recurrenceInterval,
          recurrence_end_date: input.recurrenceEndDate?.toISOString(),
          recurrence_days: input.recurrenceDays,
          recurrence_count: input.recurrenceCount,
          created_by: createdBy,
          family_id: familyId
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Add attendees if specified
      if (input.attendeeIds && input.attendeeIds.length > 0) {
        const attendees = input.attendeeIds.map(memberId => ({
          event_id: event.id,
          family_member_id: memberId,
          can_view: true,
          can_edit: false, // Only creator can edit by default
          rsvp_status: 'pending'
        }));

        const { error: attendeesError } = await supabase
          .from('event_attendees')
          .insert(attendees);

        if (attendeesError) {
          console.error('Error adding attendees:', attendeesError);
          // Don't fail the whole operation if attendees fail
        }
      }

      return dbEventToUIEvent(event as CalendarEventDB);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsForRange(
    familyMemberId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          event_attendees!inner(family_member_id, can_view)
        `)
        .or(`created_by.eq.${familyMemberId},event_attendees.family_member_id.eq.${familyMemberId}`)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map((event: any) => dbEventToUIEvent(event as CalendarEventDB));
    } catch (error) {
      console.error('Error fetching events for range:', error);
      return [];
    }
  }

  /**
   * Get all events for a family member (any date range)
   */
  static async getEventsForMember(
    familyMemberId: string
  ): Promise<CalendarEvent[]> {
    try {
      // Get events created by this member
      const { data: createdEvents, error: createdError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('created_by', familyMemberId)
        .order('start_time', { ascending: true });

      if (createdError) throw createdError;

      // Get events this member is invited to
      const { data: attendeeEvents, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('family_member_id', familyMemberId)
        .eq('can_view', true);

      if (attendeeError) throw attendeeError;

      if (attendeeEvents && attendeeEvents.length > 0) {
        const eventIds = attendeeEvents.map(a => a.event_id);
        const { data: invitedEvents, error: invitedError } = await supabase
          .from('calendar_events')
          .select('*')
          .in('id', eventIds)
          .order('start_time', { ascending: true });

        if (invitedError) throw invitedError;

        // Combine and deduplicate
        const allEvents = [...(createdEvents || []), ...(invitedEvents || [])];
        const uniqueEvents = Array.from(
          new Map(allEvents.map(event => [event.id, event])).values()
        );

        return uniqueEvents.map(event => dbEventToUIEvent(event as CalendarEventDB));
      }

      return (createdEvents || []).map(event => dbEventToUIEvent(event as CalendarEventDB));
    } catch (error) {
      console.error('Error fetching events for member:', error);
      return [];
    }
  }

  /**
   * Get all events for a family (for Family Dashboard)
   */
  static async getEventsForFamily(
    familyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', familyId)
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(event => dbEventToUIEvent(event as CalendarEventDB));
    } catch (error) {
      console.error('Error fetching events for family:', error);
      return [];
    }
  }

  /**
   * Get a single event by ID
   */
  static async getEventById(eventId: string): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      return dbEventToUIEvent(data as CalendarEventDB);
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    eventId: string,
    updates: Partial<CreateEventInput>
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.start) updateData.start_time = updates.start.toISOString();
      if (updates.end) updateData.end_time = updates.end.toISOString();
      if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay;
      if (updates.type) updateData.event_type = updates.type;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
      if (updates.recurrenceType !== undefined) updateData.recurrence_type = updates.recurrenceType;
      if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval;
      if (updates.recurrenceEndDate) updateData.recurrence_end_date = updates.recurrenceEndDate.toISOString();
      if (updates.recurrenceDays !== undefined) updateData.recurrence_days = updates.recurrenceDays;
      if (updates.recurrenceCount !== undefined) updateData.recurrence_count = updates.recurrenceCount;

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId);

      if (error) throw error;

      // Update attendees if specified
      if (updates.attendeeIds) {
        // Remove existing attendees
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId);

        // Add new attendees
        if (updates.attendeeIds.length > 0) {
          const attendees = updates.attendeeIds.map(memberId => ({
            event_id: eventId,
            family_member_id: memberId,
            can_view: true,
            can_edit: false,
            rsvp_status: 'pending'
          }));

          await supabase
            .from('event_attendees')
            .insert(attendees);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  /**
   * Add attendee to an event
   */
  static async addAttendee(
    eventId: string,
    familyMemberId: string,
    canEdit: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          family_member_id: familyMemberId,
          can_view: true,
          can_edit: canEdit,
          rsvp_status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding attendee:', error);
      return false;
    }
  }

  /**
   * Remove attendee from an event
   */
  static async removeAttendee(
    eventId: string,
    familyMemberId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('family_member_id', familyMemberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing attendee:', error);
      return false;
    }
  }

  /**
   * Get attendees for an event
   */
  static async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }
  }

  /**
   * Update RSVP status
   */
  static async updateRSVP(
    eventId: string,
    familyMemberId: string,
    status: 'pending' | 'accepted' | 'declined' | 'tentative'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ rsvp_status: status })
        .eq('event_id', eventId)
        .eq('family_member_id', familyMemberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating RSVP:', error);
      return false;
    }
  }

  /**
   * Get events for today
   */
  static async getTodayEvents(familyMemberId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEventsForRange(familyMemberId, today, tomorrow);
  }

  /**
   * Get events for this week
   */
  static async getWeekEvents(familyMemberId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return this.getEventsForRange(familyMemberId, today, weekEnd);
  }

  /**
   * Get events for a specific month
   */
  static async getMonthEvents(
    familyMemberId: string,
    year: number,
    month: number
  ): Promise<CalendarEvent[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    return this.getEventsForRange(familyMemberId, startDate, endDate);
  }
}
