-- Drop the old policy
DROP POLICY IF EXISTS "Events public read" ON events;

-- Create new policy without authentication requirement
CREATE POLICY "Events public read" ON events
  FOR SELECT USING (true);
