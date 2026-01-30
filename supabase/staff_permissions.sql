-- Ensure Staff can read all profiles to view the Users list
-- This executes the same logic as fix_rls_recursion.sql but focuses on the specific request.

-- 1. Ensure the helper function exists and is secure
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

-- 2. Update the policy for profiles to allow Staff and Admin to view all
DROP POLICY IF EXISTS "Staff and admin can read all profiles" ON profiles;

CREATE POLICY "Staff and admin can read all profiles" ON profiles
  FOR SELECT USING (is_staff_or_admin());

-- 3. Update attendance policy as well since Staff needs to scan (Asistencia)
DROP POLICY IF EXISTS "Staff manage attendance" ON attendance;

CREATE POLICY "Staff manage attendance" ON attendance
  FOR ALL USING (is_staff_or_admin());
