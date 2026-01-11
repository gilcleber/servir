-- SCRIPT DE CORREÇÃO DE PERFIL
-- RODE ISSO NO SUPABASE SQL EDITOR

-- 1. Garante que existe pelo menos uma igreja (se não tiver, cria)
INSERT INTO public.churches (name)
SELECT 'Igreja Sede'
WHERE NOT EXISTS (SELECT 1 FROM public.churches);

-- 2. Cria ou Atualiza o Perfil do Líder
INSERT INTO public.profiles (id, church_id, name, email, role)
SELECT 
    auth.users.id,                                     -- Pega o ID do login
    (SELECT id FROM public.churches LIMIT 1),          -- Pega a primeira igreja achada
    'Gil Cleber',                                      -- Nome
    'gilcleberlocutor@gmail.com',                      -- Email
    'leader'                                           -- Cargo correto
FROM auth.users
WHERE auth.users.email = 'gilcleberlocutor@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'leader', church_id = (SELECT id FROM public.churches LIMIT 1);

-- 3. Confirmação
SELECT * FROM public.profiles WHERE email = 'gilcleberlocutor@gmail.com';
