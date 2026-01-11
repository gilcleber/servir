'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

export async function loginVolunteer(pin: string) {
    // 1. Validate Input
    if (!pin || pin.length !== 4) return { error: 'PIN inválido.' }

    // 2. Hash PIN
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 3. Use Admin Client to bypass RLS and find user by PIN
    // (Profiles table is usually readable, but searching by hidden field might be restricted)
    const supabaseAdmin = createAdminClient()

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer')
        .eq('pin', pinHash)
        .single() // Expect unique PIN hash

    if (error || !profile) {
        console.error("Login fail:", error)
        // Add fake delay to prevent timing attacks?
        return { error: 'PIN incorreto ou não encontrado.' }
    }

    if (!profile.email) {
        return { error: 'Conta de voluntário incompleta (sem e-mail).' }
    }

    // 4. Create Session using standard Client (to set cookies)
    const supabase = await createClient()

    // Try signing in with Email + PIN (assuming PIN is the password)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: pin // Password MUST match PIN.
    })

    if (signInError) {
        console.error("Auth fail:", signInError)
        return { error: 'Falha na autenticação segura. Contate o suporte.' }
    }

    // Success
    return { success: true }
}

export async function loginLeader(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciais inválidas.' }
    }

    // SELF-HEALING: Ensure metadata is correct
    if (user && (!user.user_metadata?.role || user.user_metadata?.role !== 'leader')) {
        // Create Admin Client to read profile and update user
        const supabaseAdmin = createAdminClient()
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()

        if (profile?.role === 'leader') {
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: { role: 'leader' }
            })
            // Refresh session if possible, but middleware will need a refresh. 
            // Ideally we just proceed, user might need one refresh.
        }
    }

    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}
