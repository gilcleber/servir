'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

export async function loginVolunteer(pin: string) {
    const supabase = await createClient()

    // 1. Hash the input PIN (Deterministic SHA-256 for lookup)
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Find profile with this PIN
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer')
        .eq('pin', pinHash)
        .single()

    if (error || !profile) {
        return { error: 'PIN inválido ou voluntário não encontrado.' }
    }

    // 3. Create a session for the volunteer
    // Since volunteers don't have email/password in this flow, we might need a custom flow.
    // Ideally, valid Supabase Auth users should exist.
    // For this MVP, if the profile exists, we can sign them in as an anonymous user 
    // OR (Better) we should have created a shadowy auth user for them?

    // STRATEGY: 
    // For the MVP to work smoothly with RLS policies based on auth.uid(), 
    // the volunteer MUST have an entry in auth.users.
    // If they only have a profile, 'auth.uid()' won't work.
    // So, we assume that when a volunteer is created, an auth user is also created 
    // (maybe email = volunteerID@servir.app / password = pin?).

    // ALTERNATIVE (Simpler for "PIN ONLY"):
    // Use `signInWithPassword` using a generated email/pass.
    // We assume the Admin System generated:
    // Email: {profile.id}@servir.app (or similar deterministic email)
    // Password: {pin} (or a master pass?)

    // Let's try to Sign In using the Profile ID.
    // If the profile exists, we try to sign in.

    // Hack for MVP:
    // We can't easily sign them in without a password.
    // If we want "True" PIN login, we usually use a Custom JWT or Anonymous Sign in + Metadata.

    // Let's use a "Magic Link" or just "Sign In as existing user" if we knew the credentials.

    // REVISED STRATEGY FOR MVP:
    // We will assume the Volunteer has an account `[pin]@servir.local` and password `[pin]`.
    // Wait, that's insecure if PIN is short.

    // Let's go with: 
    // 1. Verify PIN in Profile.
    // 2. If valid, we create a CUSTOM SESSION cookie or JWT manually? 
    // No, Supabase Auth is best.

    // WORKING SOLUTION:
    // Admin creates user with Email/Password. 
    // Volunteer enters PIN. 
    // Backend looks up Profile -> gets Email (hidden) -> signs in? 
    // We can't get the password back.

    // OK, simplest path:
    // The 'Volunteer Login' is actually just matching the 'profiles' table.
    // But we need `auth.uid()` for RLS.
    // So we must `signIn`.

    // Let's assume for this MVP we are using a custom cookie `servir-volunteer-id` 
    // and we adjust RLS or Middleware? 
    // No, the prompt insists on RLS `auth.uid() = id`.

    // So the user MUST be authenticated in Supabase Auth.

    // IMPLEMENTATION:
    // When a volunteer is created (Admin Panel), we create a Supabase Auth user.
    // Email: `vol_{generated_uuid}@servir.app`
    // Password: `servir_{pin}` (or something we can reconstruct).

    // Let's try to reconstruct credentials:
    // If we found the `profile` via PIN hash:
    // We don't have the password.

    // OK, PLAN B (Common in these apps):
    // We use `supabase.auth.signInWithPassword` with a "System User" for volunteers? No.

    // Let's go with **Custom JWT**? Too complex.

    // Let's use **Magic Link** sent to a fake email? No.

    // Okay, let's look at the "Admin Create Volunteer" requirement.
    // "Create Volunteer (Generate PIN)".
    // If we generate the PIN, we can set the password to that PIN (or similar).
    // So:
    // User enters PIN.
    // We query `profiles` by PIN Hash to find the `email` (which might be real or generated).
    // WAIT, `profiles` table has `email`.

    // If `profiles.email` is present, we try `signInWithPassword(email, PIN)`. 
    // (Assuming password == PIN for volunteers). 
    // This is the most logical path for a PIN-based login in an MVP.

    // So the flow:
    // 1. Find profile by `pin` hash.
    // 2. Get `profile.email`.
    // 3. `supabase.auth.signInWithPassword({ email, password: pin })` 
    //    (We assume the password is the PIN unhashed).

    if (!profile.email) {
        return { error: 'Perfil sem e-mail associado.' }
    }

    // Attempt login with PIN as password
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: pin // Trying the raw PIN as password
    })

    if (authError) {
        return { error: 'Erro de autenticação interno. Contate o líder.' }
    }

    return { success: true }
}

export async function loginLeader(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}
