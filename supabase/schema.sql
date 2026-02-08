-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM: Updated with all system roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin', 'ponente', 'owner', 'vip');
    ELSE
        -- If already exists, we will alter it later via migrations, but for schema def we declare full set
        -- Note: This ELSE block is just for safety in scripts, 'CREATE TYPE' fails if exists without 'IF NOT EXISTS' equivalent in Postgres (which doesn't exist for types directly)
        NULL;
    END IF;
END $$;

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  short_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  degree TEXT CHECK (degree IN ('Licenciatura', 'Maestría', 'Doctorado', 'Especialidad', 'Estudiante', 'Profesor')),
  gender TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro', 'Neutro')),
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TIMESTAMPTZ NOT NULL,
  type TEXT,
  image_url TEXT,
  speaker_id UUID REFERENCES profiles(id),
  tags TEXT[],
  gives_certificate BOOLEAN DEFAULT FALSE,
  duration_days INTEGER DEFAULT 1,
  -- Foreign key to conferences if applicable (added in migrations)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_by UUID REFERENCES profiles(id), -- Staff who scanned
  UNIQUE(user_id, event_id)
);

-- EVENT INTERESTS
CREATE TABLE IF NOT EXISTS event_interests (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- FUNCTION: Generate Short ID
-- Format: CK2-[A-Z0-9]{4}
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    new_id := 'CK2-' || result;
    
    SELECT count(*) > 0 INTO exists FROM profiles WHERE short_id = new_id;
    
    IF NOT exists THEN
      NEW.short_id := new_id;
      EXIT;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER for Short ID
DROP TRIGGER IF EXISTS trigger_generate_short_id ON profiles;
CREATE TRIGGER trigger_generate_short_id
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_short_id();

-- RLS ENABLING
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- SECURITY DEFINER FUNCTIONS (Prevents Recursion)
-------------------------------------------------------------------------------

-- Check if user is Admin OR Owner
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'owner')
  );
$$;

-- Check if user is Staff OR Admin OR Owner
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'staff' OR role = 'admin' OR role = 'owner')
  );
$$;

-------------------------------------------------------------------------------
-- POLICIES
-------------------------------------------------------------------------------

-- Profiles:
-- Users can read own profile.
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Staff/Admin/Owner can read all profiles (Safe via function)
DROP POLICY IF EXISTS "Staff and admin can read all profiles" ON profiles;
CREATE POLICY "Staff and admin can read all profiles" ON profiles
  FOR SELECT USING (is_staff_or_admin());

-- Admins/Owners full access profiles
DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;
CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL USING (is_admin());


-- Events:
-- Public read (anyone can view events, including anonymous users)
DROP POLICY IF EXISTS "Events public read" ON events;
CREATE POLICY "Events public read" ON events
  FOR SELECT USING (true);

-- Admins/Owners manage events
DROP POLICY IF EXISTS "Admins manage events" ON events;
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (is_admin());


-- Attendance:
-- Users can read own attendance
DROP POLICY IF EXISTS "Users read own attendance" ON attendance;
CREATE POLICY "Users read own attendance" ON attendance
  FOR SELECT USING (user_id = auth.uid());

-- Staff/Admin/Owner can insert and read attendance
DROP POLICY IF EXISTS "Staff manage attendance" ON attendance;
CREATE POLICY "Staff manage attendance" ON attendance
  FOR ALL USING (is_staff_or_admin());


-- Event Interests:
DROP POLICY IF EXISTS "Users manage own interests" ON event_interests;
CREATE POLICY "Users manage own interests" ON event_interests
  FOR ALL USING (user_id = auth.uid());
