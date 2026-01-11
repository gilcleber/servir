'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function checkSystemStatus() {
    const supabaseAdmin = createAdminClient()

    // 1. Check DB Connection & Church
    const { data: church, error: churchError } = await supabaseAdmin.from('churches').select('id, name').limit(1).single()

    // 2. Check Owner Profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, role, church_id')
        .eq('email', 'gilcleberlocutor@gmail.com')
        .single()

    return {
        dbConnected: !churchError,
        churchExists: !!church,
        ownerProfileExists: !!profile,
        ownerRole: profile?.role,
        churchId: church?.id
    }
}

export async function repairSystem() {
    const supabaseAdmin = createAdminClient()
    const targetEmail = 'gilcleberlocutor@gmail.com'
    const logs = []

    try {
        logs.push("Iniciando reparo...")

        // 1. Ensure Church
        const { data: existingChurch } = await supabaseAdmin.from('churches').select('id').single()
        let churchId = existingChurch?.id

        if (!churchId) {
            logs.push("Criando Igreja Sede...")
            const { data: newChurch, error } = await supabaseAdmin.from('churches').insert({ name: 'Igreja Sede' }).select().single()
            if (error) throw new Error("Falha ao criar igreja: " + error.message)
            if (!newChurch) throw new Error("Igreja criada mas não retornada.")
            churchId = newChurch.id
            logs.push("Igreja criada: " + churchId)
        } else {
            logs.push("Igreja encontrada: " + churchId)
        }

        // 2. Find Auth User (or create if missing - requires admin.createUser)
        // We can't easily retrieve Auth ID by email with admin client in all cases unless we list users.
        // Assuming user exists because they are trying to login.
        // But for robustness, let's try to UPDATE the user first, or just UPSERT profile if we can guess the ID.
        // Wait, we need the AUTH ID to create a profile.

        // WORKAROUND: We can't get the User ID easily if they aren't logged in. 
        // We will assume the user has logged in at least once or exists. 
        // Actually, we can list users by email if we have permissions.

        // Let's rely on the user having created the account.
        // If we can't find the user ID, we can't fix the profile.

        // BUT, notice `loginLeader` gets `user` from `signInWithPassword`.
        // Here we are outside login context.

        // BETTER STRATEGY: 
        // Instead of blind repair, this page should ask for EMAIL + PASSWORD to authenticate specifically for repair.
        // Or we just tell them "Login first then click repair"? No.

        // Let's create a specialized 'Repair Login' that forces the fix.
        return { success: false, logs, message: "Use o formulário para autenticar e reparar." }

    } catch (e: any) {
        return { success: false, logs, error: e.message }
    }
}

export async function forceRepairLogin(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // VALIDATION: Check if Service Role Key is configured correctly
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!serviceKey) return { error: "CONFIGURAÇÃO ERRO: 'SUPABASE_SERVICE_ROLE_KEY' não encontrada no ambiente." }
    if (serviceKey === anonKey) return { error: "CONFIGURAÇÃO ERRO: Você colocou a chave pública no lugar da chave secreta (Service Role) no Vercel." }

    const supabaseAdmin = createAdminClient()
    const supabase = await createClient()

    // 1. Regular Auth Check to get User ID
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error || !user) {
        return { error: "Login falhou. Verifique senha." }
    }

    // 2. FORCE FIX
    // Ensure Church
    const { data: church } = await supabaseAdmin.from('churches').select('id').single()
    let churchId = church?.id
    if (!churchId) {
        const { data: newChurch } = await supabaseAdmin.from('churches').insert({ name: 'Igreja Sede' }).select().single()
        churchId = newChurch?.id
    }

    // Force Profile Upsert
    const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: email,
        name: 'Admin Restaurado',
        role: 'leader',
        church_id: churchId
    })

    if (upsertError) {
        return { error: "Falha ao recriar perfil: " + upsertError.message }
    }

    // Update Metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { role: 'leader' }
    })

    return { success: true }
}
