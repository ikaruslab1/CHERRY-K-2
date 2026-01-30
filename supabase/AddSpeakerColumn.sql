-- Add speaker_id column to events table
ALTER TABLE events ADD COLUMN speaker_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
