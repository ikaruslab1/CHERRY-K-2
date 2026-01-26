-- FUNCTION: Check if user is Staff or Admin (Bypassing RLS)
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'staff' OR role = 'admin')
  );
$$;

-- FUNCTION: Check if user is Admin (Bypassing RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- DROP EXISTING POLICIES TO RE-CREATE THEM SAFELY
DROP POLICY IF EXISTS "Staff and admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;
DROP POLICY IF EXISTS "Admins manage events" ON events;
DROP POLICY IF EXISTS "Staff manage attendance" ON attendance;

-- RE-CREATE POLICIES USING HELPER FUNCTIONS

-- Profiles
CREATE POLICY "Staff and admin can read all profiles" ON profiles
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL USING (is_admin());

-- Events
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (is_admin());

-- Attendance
CREATE POLICY "Staff manage attendance" ON attendance
  FOR ALL USING (is_staff_or_admin());
