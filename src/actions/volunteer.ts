'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fetchVolunteerAssignments() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Ideally, valid auth user's email matches the profile email.
    // Or we find the profile by user ID if we linked them.
    // In our Login logic, we signed in using `profile.email`. 
    // So `user.email` should match `profile.email`.

    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email!)
        .single()

    if (!profile) return []

    const { data, error } = await supabase
        .from('assignments')
        .select(`
      id,
      status,
      created_at,
      schedule_id,
      profile_id,
      schedule:schedules (
        id,
        date,
        ministry:ministries (id, name),
        service_time:service_times (id, time)
      )
    `)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true }) // Should filter by date > now ideally

    // Need to transform for the frontend if types differ slightly
    // But let's try to match the return to what the Component expects.
    // The component expects: assignment, schedule (with ministries, service_times)

    return data || []
}

export async function updateAssignmentStatus(assignmentId: string, status: 'confirmed' | 'declined' | 'pending') {
    const supabase = await createClient()
    const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', assignmentId)

    if (error) {
        return { error: 'Falha ao atualizar status.' }
    }

    revalidatePath('/volunteer')
    return { success: true }
}

export async function fetchAvailability(year: number, month: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email!)
        .single()

    if (!profile) return []

    // Fetch availability for the range
    // For MVP just fetch all for this user
    const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('profile_id', profile.id)

    return data || []
}

export async function updateAvailability(date: string, status: 'available' | 'unavailable' | 'uninformed') {
    // Upsert logic
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, church_id')
        .eq('email', user.email!)
        .single()

    if (!profile) return { error: 'Perfil não encontrado.' }

    let churchId = profile.church_id
    if (!churchId) {
        // Fallback: Fetch the first church in the system (Prototype/Fix for "Fake Pastor")
        const { data: church } = await supabase.from('churches').select('id').limit(1).single()
        if (church) {
            churchId = church.id
            // Optional: Auto-fix profile
            // await supabase.from('profiles').update({ church_id: church.id }).eq('id', profile.id)
        } else {
            return { error: 'Erro crítico: Nenhuma igreja encontrada no sistema.' }
        }
    }

    const { error: upsertError } = await supabase
        .from('availability')
        .upsert({
            profile_id: profile.id,
            date,
            status,
            church_id: churchId
        }, {
            onConflict: 'profile_id,date'
        })

    if (upsertError) {
        console.error("Availability Update Error:", upsertError)
        return { error: `Erro ao salvar: ${upsertError.message || upsertError.details || 'Erro desconhecido'}` }
    }
    // Actually, passing church_id is safer/required if column is not nullable.
    // Let's fetch it.

    return { success: true }
}
