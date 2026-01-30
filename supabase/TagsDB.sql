-- Add tags column to events table
ALTER TABLE events 
ADD COLUMN tags text[] DEFAULT '{}';

-- Update existing rows if necessary (optional, defaults to empty array)
-- UPDATE events SET tags = '{}' WHERE tags IS NULL;
