-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM
CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  short_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  degree TEXT CHECK (degree IN ('Licenciatura', 'Maestría', 'Doctorado', 'Especialidad')),
  gender TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro')),
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TIMESTAMPTZ NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTENDANCE TABLE
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_by UUID REFERENCES profiles(id), -- Staff who scanned
  UNIQUE(user_id, event_id)
);

-- EVENT INTERESTS
CREATE TABLE event_interests (
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
CREATE TRIGGER trigger_generate_short_id
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_short_id();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles:
-- Users can read own profile.
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Staff can read all profiles
CREATE POLICY "Staff and admin can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin'))
  );

-- Admins can do everything
CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Events:
-- Public read (anyone can view events, including anonymous users)
CREATE POLICY "Events public read" ON events
  FOR SELECT USING (true);

-- Admins manage events
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Attendance:
-- Users can read own attendance
CREATE POLICY "Users read own attendance" ON attendance
  FOR SELECT USING (user_id = auth.uid());

-- Staff can insert and read attendance
CREATE POLICY "Staff manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin'))
  );

-- Event Interests:
CREATE POLICY "Users manage own interests" ON event_interests
  FOR ALL USING (user_id = auth.uid());
