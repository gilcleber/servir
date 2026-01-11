'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin' // Needed to create Auth Users
import { createHash } from 'crypto'

export async function createVolunteer(name: string, email: string, ministries: string[], churchId: string) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Generate PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Create Auth User
    // We use the provided email or a generated one + PIN as password
    const userEmail = email || `vol_${Date.now()}@servir.app`

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: pin,
        email_confirm: true,
        user_metadata: { name, role: 'volunteer' }
    })

    if (authError || !authUser.user) {
        return { error: 'Falha ao criar usuário de autenticação: ' + authError?.message }
    }

    // 3. Create Profile
    // We insert into profiles using the Auth ID
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authUser.user.id, // Link to Auth User
            church_id: churchId,
            name,
            email: userEmail,
            role: 'volunteer',
            pin: pinHash, // Storing hashed
            ministry_ids: ministries
        })
        .select()
        .single()

    if (profileError) {
        return { error: 'Falha ao criar perfil: ' + profileError.message }
    }

    return { success: true, pin, profile }
}
