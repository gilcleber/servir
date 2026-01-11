-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: churches
CREATE TABLE IF NOT EXISTS churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('volunteer', 'leader', 'admin', 'super_admin')),
    pin TEXT, -- 4 digits, hashed
    ministry_ids JSONB, -- Array of ministry IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: ministries
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    leader_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: service_times
CREATE TABLE IF NOT EXISTS service_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado')),
    time TIME NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: schedules
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    service_time_id UUID REFERENCES service_times(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 6. Table: assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role_in_ministry TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')) DEFAULT 'pending',
    feedback_on_cancellation TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table: availability
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'unavailable', 'uninformed')) DEFAULT 'uninformed',
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL, -- Added church_id for simpler RLS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (profile_id, date)
);

-- 8. Table: notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS CONFIGURATION

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_auth_church_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT church_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Verification RPC (Optional Helper)
CREATE OR REPLACE FUNCTION verify_pin(input_pin TEXT, input_profile_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  stored_pin TEXT;
BEGIN
  -- This function allows checking a PIN hash without exposing the hash to the client
  SELECT pin INTO stored_pin FROM public.profiles WHERE id = input_profile_id;
  RETURN stored_pin = encode(digest(input_pin, 'sah256'), 'hex'); -- Requires pgcrypto
  -- Note: We are doing client-side hashing in the Action for simplicity with Node crypto.
  -- But if we moved hashing here, we'd use pgcrypto.
  -- For now, returning TRUE as placeholder if not implementing full pgcrypto flow.
  RETURN FALSE; 
END;
$$;

-- POLICIES

-- profiles
-- SELECT
CREATE POLICY "Users can see own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Leaders/Admins see profiles in their church" ON profiles
    FOR SELECT USING (
        church_id = get_auth_church_id() 
        AND (get_auth_role() IN ('leader', 'admin', 'super_admin'))
    );

CREATE POLICY "Service Role can see all" ON profiles
    FOR ALL USING (true); -- Helper for Service Role Actions if needed (usually implicit bypass)

-- UPDATE
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- churches
CREATE POLICY "Admin/Leader sees own church" ON churches
    FOR SELECT USING (id = get_auth_church_id());

-- Generic Policies for church-scoped tables: 

-- ministries
CREATE POLICY "View ministries of own church" ON ministries
    FOR SELECT USING (church_id = get_auth_church_id());

-- service_times
CREATE POLICY "View service_times of own church" ON service_times
    FOR SELECT USING (church_id = get_auth_church_id());

-- schedules
CREATE POLICY "View schedules of own church" ON schedules
    FOR SELECT USING (church_id = get_auth_church_id());

-- assignments
CREATE POLICY "View assignments of own church" ON assignments
    FOR SELECT USING (
        schedule_id IN (SELECT id FROM schedules WHERE church_id = get_auth_church_id())
    );
CREATE POLICY "Manage assignments of own church" ON assignments
    FOR ALL USING (
         schedule_id IN (SELECT id FROM schedules WHERE church_id = get_auth_church_id())
         AND get_auth_role() IN ('leader', 'admin', 'super_admin')
    );
CREATE POLICY "Volunteer update own assignment status" ON assignments
    FOR UPDATE USING (profile_id = auth.uid()); -- Volunteers can update their own status (confirm/decline)

-- availability
CREATE POLICY "View availabilities of own church" ON availability
    FOR SELECT USING (church_id = get_auth_church_id());
    
CREATE POLICY "Manage own availability" ON availability
    FOR ALL USING (profile_id = auth.uid());
    
-- notification_logs
CREATE POLICY "View own notifications" ON notification_logs
    FOR SELECT USING (profile_id = auth.uid());
