'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

export async function createVolunteer(
    name: string, 
    email: string, 
    ministries: string[], 
    churchId: string,
    role: 'volunteer' | 'leader' = 'volunteer'
) {
    const supabaseAdmin = createAdminClient()

    // 1. Generate PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Create Auth User
    const userEmail = email || `vol_${Date.now()}@servir.app`

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: pin,
        email_confirm: true,
        user_metadata: { name, role }
    })

    if (authError || !authUser.user) {
        return { error: 'Falha ao criar usuário de autenticação: ' + authError?.message }
    }

    // 3. Create Profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authUser.user.id,
            church_id: churchId,
            name,
            email: userEmail,
            role,
            pin: pinHash,
            ministry_ids: ministries
        })
        .select()
        .single()

    if (profileError) {
        return { error: 'Falha ao criar perfil: ' + profileError.message }
    }

    revalidatePath('/leader/volunteers')
    return { success: true, pin, profile }
}

export async function updateVolunteer(
    profileId: string,
    name: string,
    email: string,
    phone: string,
    ministries: string[],
    role: 'volunteer' | 'leader'
) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            name,
            email,
            phone,
            role,
            ministry_ids: ministries
        })
        .eq('id', profileId)

    if (error) return { error: 'Falha ao atualizar: ' + error.message }

    revalidatePath('/leader/volunteers')
    return { success: true }
}

export async function resetVolunteerPin(profileId: string) {
    const supabaseAdmin = createAdminClient()

    // Generate new PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(newPin).digest('hex')

    // Update profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ pin: pinHash })
        .eq('id', profileId)

    if (profileError) return { error: 'Falha ao atualizar PIN: ' + profileError.message }

    // Also update Auth password
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        profileId,
        { password: newPin }
    )

    if (authError) return { error: 'Falha ao atualizar senha: ' + authError.message }

    revalidatePath('/leader/volunteers')
    return { success: true, pin: newPin }
}

export async function deleteVolunteer(profileId: string) {
    const supabaseAdmin = createAdminClient()

    // Delete auth user (profile will cascade)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profileId)

    if (error) return { error: 'Falha ao excluir: ' + error.message }

    revalidatePath('/leader/volunteers')
    return { success: true }
}
