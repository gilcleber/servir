'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

export async function createVolunteer(
<<<<<<< HEAD
    name: string, 
    email: string, 
    ministries: string[], 
=======
    name: string,
    email: string,
    ministries: string[],
>>>>>>> 6698547 (feat: integrate lovable ui improvements, admin actions, and backend logic)
    churchId: string,
    role: 'volunteer' | 'leader' = 'volunteer'
) {
    const supabaseAdmin = createAdminClient()

    // 1. Generate PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Create Auth User
<<<<<<< HEAD
    const userEmail = email || `vol_${Date.now()}@servir.app`
=======
    // If email is empty, generate a fake one to satisfy Supabase Auth
    const userEmail = email && email.trim() !== '' ? email : `vol_${Date.now()}_${Math.floor(Math.random() * 1000)}@servir.app`
>>>>>>> 6698547 (feat: integrate lovable ui improvements, admin actions, and backend logic)

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: pin, // Using PIN as temporary password
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
    const supabaseAdmin = createAdminClient()

<<<<<<< HEAD
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            name,
            email,
            phone,
            role,
            ministry_ids: ministries
        })
=======
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
>>>>>>> 6698547 (feat: integrate lovable ui improvements, admin actions, and backend logic)
        .eq('id', profileId)

    if (error) return { error: 'Falha ao atualizar: ' + error.message }

<<<<<<< HEAD
=======
    // Also update Auth email/metadata if needed
    if (email && email.trim() !== '') {
        await supabaseAdmin.auth.admin.updateUserById(profileId, { email: email, user_metadata: { name, role } })
    } else {
        await supabaseAdmin.auth.admin.updateUserById(profileId, { user_metadata: { name, role } })
    }

>>>>>>> 6698547 (feat: integrate lovable ui improvements, admin actions, and backend logic)
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

<<<<<<< HEAD
    // Also update Auth password
=======
    // Also update Auth password so they can login with it? 
    // Wait, the system uses PIN for volunteer login, but leader login uses password.
    // If we set password = PIN, it helps if they ever try to login as leader (if promoted).
>>>>>>> 6698547 (feat: integrate lovable ui improvements, admin actions, and backend logic)
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
