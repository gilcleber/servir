'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- MINISTRY ACTIONS ---

export async function createMinistry(name: string, description?: string, leaderId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado.' }

    // Get church_id from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', user.id)
        .single()

    if (!profile?.church_id) return { error: 'Igreja não identificada.' }

    const supabaseAdmin = createAdminClient()
    const { data: ministry, error } = await supabaseAdmin
        .from('ministries')
        .insert({
            name,
            description,
            leader_profile_id: leaderId || null,
            church_id: profile.church_id
        })
        .select()
        .single()

    if (error) return { error: 'Falha ao criar ministério: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true, data: ministry }
}

export async function updateMinistry(id: string, name: string, description?: string, leaderId?: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('ministries')
        .update({
            name,
            description,
            leader_profile_id: leaderId || null
        })
        .eq('id', id)

    if (error) return { error: 'Falha ao atualizar ministério: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}

export async function deleteMinistry(id: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('ministries')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Falha ao excluir ministério: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}

export async function fetchAllMinistries() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()
    if (!profile?.church_id) return []

    const { data: ministries } = await supabase
        .from('ministries')
        .select('*')
        .eq('church_id', profile.church_id)
        .order('name') as { data: any[] }

    if (!ministries) return []

    // Fetch all leaders for this church to map them manually
    const { data: allLeaders } = await supabase
        .from('profiles')
        .select('id, name, email, ministry_ids')
        .eq('church_id', profile.church_id)
        .eq('role', 'leader')

    // Attach leaders to ministries
    const ministriesWithLeaders = ministries.map(m => {
        const ministryLeaders = allLeaders?.filter(l => l.ministry_ids?.includes(m.id)) || []
        // Fallback to legacy leader_profile_id if valid and not already in list
        if (m.leader_profile_id) {
            const legacyLeader = allLeaders?.find(l => l.id === m.leader_profile_id)
            if (legacyLeader && !ministryLeaders.find(ml => ml.id === legacyLeader.id)) {
                ministryLeaders.push(legacyLeader)
            }
        }
        return {
            ...m,
            leaders: ministryLeaders
        }
    })

    return ministriesWithLeaders
}

export async function fetchLeadersForMinistry() {
    const supabase = await createClient()
    // Need church_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()

    if (!profile?.church_id) return []

    // Fetch confirmed leaders
    const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('church_id', profile.church_id)
        .eq('role', 'leader')
        .order('name')

    return data || []
}

export async function fetchAllVolunteers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()

    if (!profile?.church_id) return []

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('church_id', profile.church_id)
        .order('name')

    return data || []
}


// --- SERVICE TIME ACTIONS ---

export async function fetchAllServiceTimes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()
    if (!profile?.church_id) return []

    const { data } = await supabase
        .from('service_times')
        .select('*')
        .eq('church_id', profile.church_id)
        .order('day_of_week') // Simplistic ordering

    return data || []
}

export async function createServiceTime(day: string, time: string, name?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado.' }
    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('service_times')
        .insert({
            church_id: profile.church_id,
            day_of_week: day,
            time,
            name
        })

    if (error) return { error: 'Falha ao criar horário: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}

export async function updateServiceTime(id: string, day: string, time: string, name?: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('service_times')
        .update({
            day_of_week: day,
            time,
            name
        })
        .eq('id', id)

    if (error) return { error: 'Falha ao atualizar horário: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}

export async function deleteServiceTime(id: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('service_times')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Falha ao excluir horário: ' + error.message }

    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}
