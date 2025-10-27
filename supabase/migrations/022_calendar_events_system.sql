-- ========================================
-- Calendar Events System Migration
-- ========================================
-- Creates tables for calendar events with recurrence support
-- Includes: events, event_attendees, recurrence patterns
-- Supports: Google Calendar sync, family member visibility
-- Date: 2025-01-26
-- ========================================

-- Calendar events table
-- Stores all calendar events with full recurrence support
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic event information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500),

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,

  -- Event classification
  event_type VARCHAR(20) NOT NULL DEFAULT 'event' CHECK (event_type IN ('task', 'event', 'deadline', 'reminder')),
  category VARCHAR(50),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),

  -- Visual
  color VARCHAR(7), -- Hex color code

  -- Source tracking
  source VARCHAR(20) DEFAULT 'family' CHECK (source IN ('family', 'google', 'mindsweep')),
  external_id VARCHAR(255), -- For Google Calendar sync

  -- Recurrence pattern
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
  recurrence_interval INTEGER DEFAULT 1, -- Every N days/weeks/months
  recurrence_end_date TIMESTAMPTZ,
  recurrence_days JSONB, -- For weekly: [0,1,2,3,4,5,6] where 0=Sunday
  recurrence_count INTEGER, -- Alternative to end_date: stop after N occurrences

  -- Ownership and family context
  created_by UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation: end time must be after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Event attendees/visibility table
-- Controls which family members can see and interact with an event
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,

  -- Permissions
  can_edit BOOLEAN DEFAULT false,
  can_view BOOLEAN DEFAULT true,

  -- RSVP status (for events)
  rsvp_status VARCHAR(20) CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'tentative')),

  -- Metadata
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each family member can only be added once per event
  UNIQUE(event_id, family_member_id)
);

-- ========================================
-- INDEXES for performance
-- ========================================

-- Index for finding events by family
CREATE INDEX IF NOT EXISTS idx_calendar_events_family
  ON calendar_events(family_id);

-- Index for finding events by creator
CREATE INDEX IF NOT EXISTS idx_calendar_events_creator
  ON calendar_events(created_by);

-- Index for time-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range
  ON calendar_events(start_time, end_time);

-- Index for recurring events
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring
  ON calendar_events(is_recurring) WHERE is_recurring = true;

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_calendar_events_type
  ON calendar_events(event_type);

-- Index for Google Calendar sync
CREATE INDEX IF NOT EXISTS idx_calendar_events_external
  ON calendar_events(source, external_id) WHERE source = 'google';

-- Index for event attendees lookups
CREATE INDEX IF NOT EXISTS idx_event_attendees_event
  ON event_attendees(event_id);

-- Index for finding events for a specific family member
CREATE INDEX IF NOT EXISTS idx_event_attendees_member
  ON event_attendees(family_member_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on both tables
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Calendar events policies
-- Users can view events they created or are invited to
CREATE POLICY "Users can view accessible events"
  ON calendar_events FOR SELECT
  USING (
    -- Events they created
    created_by = auth.uid()
    OR
    -- Events they're invited to
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = calendar_events.id
        AND ea.family_member_id = auth.uid()
        AND ea.can_view = true
    )
    OR
    -- Parents can view all family events
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.family_id = calendar_events.family_id
        AND fm.role IN ('primary_organizer', 'parent')
    )
  );

-- Users can create events in their family
CREATE POLICY "Users can create events"
  ON calendar_events FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.family_id = calendar_events.family_id
    )
  );

-- Users can update events they created or have edit permissions for
CREATE POLICY "Users can update allowed events"
  ON calendar_events FOR UPDATE
  USING (
    -- Events they created
    created_by = auth.uid()
    OR
    -- Events they have edit permission for
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = calendar_events.id
        AND ea.family_member_id = auth.uid()
        AND ea.can_edit = true
    )
    OR
    -- Parents can update all family events
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.family_id = calendar_events.family_id
        AND fm.role IN ('primary_organizer', 'parent')
    )
  );

-- Users can delete events they created
CREATE POLICY "Users can delete own events"
  ON calendar_events FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    -- Parents can delete family events
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.family_id = calendar_events.family_id
        AND fm.role IN ('primary_organizer', 'parent')
    )
  );

-- Event attendees policies
-- Users can view attendees for events they have access to
CREATE POLICY "Users can view event attendees"
  ON event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events ce
      WHERE ce.id = event_attendees.event_id
        AND (
          ce.created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM event_attendees ea2
            WHERE ea2.event_id = ce.id
              AND ea2.family_member_id = auth.uid()
              AND ea2.can_view = true
          )
          OR
          EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.id = auth.uid()
              AND fm.family_id = ce.family_id
              AND fm.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- Event creators and parents can add attendees
CREATE POLICY "Event creators can add attendees"
  ON event_attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calendar_events ce
      WHERE ce.id = event_attendees.event_id
        AND (
          ce.created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.id = auth.uid()
              AND fm.family_id = ce.family_id
              AND fm.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- Event creators and parents can update attendees
CREATE POLICY "Event creators can update attendees"
  ON event_attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events ce
      WHERE ce.id = event_attendees.event_id
        AND (
          ce.created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.id = auth.uid()
              AND fm.family_id = ce.family_id
              AND fm.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- Event creators and parents can remove attendees
CREATE POLICY "Event creators can remove attendees"
  ON event_attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events ce
      WHERE ce.id = event_attendees.event_id
        AND (
          ce.created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.id = auth.uid()
              AND fm.family_id = ce.family_id
              AND fm.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- ========================================
-- TRIGGERS for updated_at timestamp
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for calendar_events
DROP TRIGGER IF EXISTS calendar_events_updated_at ON calendar_events;
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_updated_at();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get events for a date range
CREATE OR REPLACE FUNCTION get_events_for_range(
  p_family_member_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  event_id UUID,
  title VARCHAR,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN,
  event_type VARCHAR,
  location VARCHAR,
  color VARCHAR,
  is_recurring BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title,
    ce.description,
    ce.start_time,
    ce.end_time,
    ce.is_all_day,
    ce.event_type,
    ce.location,
    ce.color,
    ce.is_recurring
  FROM calendar_events ce
  LEFT JOIN event_attendees ea ON ce.id = ea.event_id
  WHERE
    -- Time range check
    (ce.start_time BETWEEN p_start_date AND p_end_date
     OR ce.end_time BETWEEN p_start_date AND p_end_date
     OR (ce.start_time <= p_start_date AND ce.end_time >= p_end_date))
    AND
    -- Permission check
    (ce.created_by = p_family_member_id
     OR (ea.family_member_id = p_family_member_id AND ea.can_view = true))
  ORDER BY ce.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS for documentation
-- ========================================

COMMENT ON TABLE calendar_events IS
  'Stores calendar events with full recurrence support and Google Calendar sync capability';

COMMENT ON COLUMN calendar_events.event_type IS
  'Type of calendar entry: task, event, deadline, or reminder';

COMMENT ON COLUMN calendar_events.recurrence_type IS
  'Recurrence pattern: none, daily, weekly, monthly, yearly, or custom';

COMMENT ON COLUMN calendar_events.recurrence_interval IS
  'Interval for recurrence (e.g., 2 for every 2 weeks)';

COMMENT ON COLUMN calendar_events.recurrence_days IS
  'JSON array of days for weekly recurrence [0-6] where 0=Sunday';

COMMENT ON COLUMN calendar_events.source IS
  'Source of the event: family (created in app), google (synced), or mindsweep (from notes)';

COMMENT ON TABLE event_attendees IS
  'Controls which family members can view and edit calendar events';

COMMENT ON COLUMN event_attendees.can_edit IS
  'Whether this family member can edit the event';

COMMENT ON COLUMN event_attendees.rsvp_status IS
  'RSVP status for event invitations';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Calendar events system migration completed successfully';
  RAISE NOTICE 'Tables created: calendar_events, event_attendees';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Indexes created for performance';
  RAISE NOTICE 'Helper function created: get_events_for_range()';
END $$;
