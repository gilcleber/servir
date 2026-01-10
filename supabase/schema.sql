-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: churches
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: profiles
CREATE TABLE profiles (
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
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    leader_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: service_times
CREATE TABLE service_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado')),
    time TIME NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    service_time_id UUID REFERENCES service_times(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 6. Table: assignments
CREATE TABLE assignments (
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
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'unavailable', 'uninformed')) DEFAULT 'uninformed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (profile_id, date)
);

-- 8. Table: notification_logs
CREATE TABLE notification_logs (
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

CREATE POLICY "Super Admin sees all" ON profiles
    FOR SELECT USING (get_auth_role() = 'super_admin');

-- UPDATE
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Leaders/Admins update profiles in their church" ON profiles
    FOR UPDATE USING (
         church_id = get_auth_church_id() 
         AND get_auth_role() IN ('leader', 'admin')
    );

-- INSERT (Admins)
CREATE POLICY "Admins insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        get_auth_role() IN ('admin', 'super_admin')
    );

-- churches
CREATE POLICY "Admin/Leader sees own church" ON churches
    FOR SELECT USING (id = get_auth_church_id());

CREATE POLICY "Super Admin sees all churches" ON churches
    FOR SELECT USING (get_auth_role() = 'super_admin');

-- Generic Policies for church-scoped tables: 
-- ministries, service_times, schedules, assignments, availability, notification_logs

-- ministries
CREATE POLICY "View ministries of own church" ON ministries
    FOR SELECT USING (church_id = get_auth_church_id());
CREATE POLICY "Manage ministries of own church" ON ministries
    FOR ALL USING (church_id = get_auth_church_id() AND get_auth_role() IN ('leader', 'admin', 'super_admin'));

-- service_times
CREATE POLICY "View service_times of own church" ON service_times
    FOR SELECT USING (church_id = get_auth_church_id());
CREATE POLICY "Manage service_times of own church" ON service_times
    FOR ALL USING (church_id = get_auth_church_id() AND get_auth_role() IN ('admin', 'super_admin')); -- Only admin/super can manage times? Assuming leader can't.

-- schedules
CREATE POLICY "View schedules of own church" ON schedules
    FOR SELECT USING (church_id = get_auth_church_id());
CREATE POLICY "Manage schedules of own church" ON schedules
    FOR ALL USING (church_id = get_auth_church_id() AND get_auth_role() IN ('leader', 'admin', 'super_admin'));

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
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE church_id = get_auth_church_id())
    );
CREATE POLICY "Manage own availability" ON availability
    FOR ALL USING (profile_id = auth.uid());
    
-- notification_logs
CREATE POLICY "View own notifications" ON notification_logs
    FOR SELECT USING (profile_id = auth.uid());
