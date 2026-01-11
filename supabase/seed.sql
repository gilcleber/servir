-- SEED DATA SCRIPT
-- Run this in Supabase SQL Editor to populate initial test data.

-- 1. Create Church
INSERT INTO public.churches (id, name, logo_url)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Igreja Exemplo', 'https://placehold.co/100')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Ministry
INSERT INTO public.ministries (id, church_id, name, description)
VALUES 
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Louvor', 'Equipe de música')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Service Time
INSERT INTO public.service_times (id, church_id, day_of_week, time, name)
VALUES 
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Domingo', '09:00', 'Culto Matinal')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Schedule (Future Date)
INSERT INTO public.schedules (id, church_id, ministry_id, date, service_time_id)
VALUES 
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', (CURRENT_DATE + INTERVAL '7 days'), 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33')
ON CONFLICT (id) DO NOTHING;

-- NOTE: Profiles and Assignments usually require AUTH USERS to exist first.
-- To properly seed users, you should use the Application's "Sign Up" or "Create Volunteer" flows.
-- However, we can insert dummy profiles if we assume you will create matching Auth Users manually or via script.

-- WARNING: The functionality of the app depends on Profiles linked to Auth Users.
-- It is recommended to create the Leader and Volunteer using the APP interface (or verify them manually).
