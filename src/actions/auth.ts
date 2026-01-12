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
        .in('role', ['volunteer', 'leader'])
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

    // Try signing in with Email + PIN (using doubled PIN for length requirements)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: pin + pin // Password is stored as PIN+PIN to satisfy 6-char limit
    })

    if (signInError) {
        console.error("Auth fail:", signInError)
        return { error: 'Falha na autenticação segura. Contate o suporte.' }
    }

    // Success
    const role = profile.role || 'volunteer'
    const redirectTo = (role === 'leader' || role === 'admin') ? '/leader' : '/volunteer'

    return { success: true, role, redirectTo }
}

export async function loginLeader(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabaseAdmin = createAdminClient()
    // Select role and handle case/whitespace
    const { data: profile } = await supabaseAdmin.from('profiles').select('id, role, name').eq('email', email).single()

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !user) {
        return { error: 'Credenciais inválidas.' }
    }

    // Role Validation
    const role = profile?.role?.toLowerCase().trim()
    const allowedRoles = ['leader', 'admin', 'super_admin']

    if (!role || !allowedRoles.includes(role)) {

        // --- EMERGENCY AUTO-FIX FOR OWNER ---
        // Se for o dono do sistema e não tiver perfil, cria agora mesmo.
        const normalizedEmail = email.toLowerCase().trim()
        const targetEmail = 'gilcleberlocutor@gmail.com'

        if (normalizedEmail === targetEmail) {
            console.log("[AutoFix] Detectado dono sem perfil. Iniciando reparo...")

            // 1. Garante Igreja
            const { data: church } = await supabaseAdmin.from('churches').select('id').maybeSingle() // Use maybeSingle to avoid error on empty
            let churchId = church?.id

            if (!churchId) {
                console.log("[AutoFix] Criando Igreja Sede...")
                const { data: newChurch, error: churchError } = await supabaseAdmin.from('churches').insert({ name: 'Igreja Sede' }).select().single()
                if (churchError) console.error("[AutoFix] Erro igreja:", churchError)
                churchId = newChurch?.id
            }

            // 2. Cria Perfil
            if (churchId) {
                console.log("[AutoFix] Criando Perfil...")
                const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
                    id: user.id,
                    email: normalizedEmail,
                    name: 'Gil Cleber',
                    role: 'leader',
                    church_id: churchId
                })

                if (upsertError) {
                    console.error("[AutoFix] Erro perfil:", upsertError)
                    // If error, we fall through to the access denied message below
                } else {
                    console.log("[AutoFix] Sucesso! Redirecionando...")
                    // Sucesso! Deixa passar.
                    return { success: true, redirectTo: '/leader' }
                }
            } else {
                console.error("[AutoFix] Falha crítica: Sem ID de igreja.")
            }
        }
        // -------------------------------------

        // Critical Feedback: Tell the user WHY they are not entering
        // Also sign them out immediately to prevent stuck session
        await supabase.auth.signOut()
        return { error: `Acesso negado. Seu perfil é: '${role || 'Não definido'}'. Necessário: 'leader'.` }
    }

    // Update Metadata to ensure Middleware is Happy
    if (user && user.user_metadata?.role !== role) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: { role: role }
        })
    }

    return { success: true, redirectTo: '/leader' }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
