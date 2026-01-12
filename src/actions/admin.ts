'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createHash } from 'crypto'

export async function createVolunteer(
    name: string,
    email: string,
    ministries: string[],
    churchId: string,
    role: 'volunteer' | 'leader' = 'volunteer'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado.' }

    const supabaseAdmin = createAdminClient()

    // 1. Generate PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Create Auth User
    // If email is empty, generate a fake one to satisfy Supabase Auth
    const userEmail = email && email.trim() !== '' ? email : `vol_${Date.now()}_${Math.floor(Math.random() * 1000)}@servir.app`

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: pin + pin, // Using PIN+PIN to satisfy 6-char minimum
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
        // Rollback auth user if profile creation fails? For now just return error.
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado.' }

    const supabaseAdmin = createAdminClient()

    const updateData: any = {
        name,
        phone,
        role,
        ministry_ids: ministries
    }

    if (email && email.trim() !== '') {
        updateData.email = email
    }

    const { error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', profileId)

    if (error) return { error: 'Falha ao atualizar: ' + error.message }

    // Also update Auth email/metadata if needed
    // Note: Updating email in Auth might require re-verification depending on settings.
    // For now we assume we can update it administratively.
    if (email && email.trim() !== '') {
        await supabaseAdmin.auth.admin.updateUserById(profileId, { email: email, user_metadata: { name, role } })
    } else {
        await supabaseAdmin.auth.admin.updateUserById(profileId, { user_metadata: { name, role } })
    }

    revalidatePath('/leader/volunteers')
    return { success: true }
}

export async function resetVolunteerPin(profileId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado.' }

    const supabaseAdmin = createAdminClient()

    // Generate new PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString()
    console.log(`[Admin] Resetting PIN for ${profileId} to ${newPin} (Auth Password: ${newPin + newPin})`)
    const pinHash = createHash('sha256').update(newPin).digest('hex')

    // Update profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ pin: pinHash })
        .eq('id', profileId)

    if (profileError) return { error: 'Falha ao atualizar PIN: ' + profileError.message }

    // Also update Auth password so they can login with it? 
    // Wait, the system uses PIN for volunteer login, but leader login uses password.
    // Update Auth password with 6+ chars
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        profileId,
        { password: newPin + newPin }
    )

    if (authError) return { error: 'Falha ao atualizar senha: ' + authError.message }

    revalidatePath('/leader/volunteers')
    return { success: true, pin: newPin }
}

export async function deleteVolunteer(profileId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado.' }

    const supabaseAdmin = createAdminClient()

    // Delete auth user (profile will cascade because of FK constraint usually, but we check)
    // Actually, earlier we saw ON DELETE CASCADE.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profileId)

    if (error) return { error: 'Falha ao excluir: ' + error.message }

    revalidatePath('/leader/volunteers')
    return { success: true }
}
