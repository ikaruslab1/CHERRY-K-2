-- Add duration_days column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1;

-- Drop unique constraint on attendance (user_id, event_id) to allow multiple scans (attendance days)
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_user_id_event_id_key;
