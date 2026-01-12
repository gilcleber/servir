'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function fetchAllMinistries() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('ministries')
        .select(`
            id, 
            name, 
            description,
            leader_profile_id,
            leader:profiles!leader_profile_id(id, name, avatar_url)
        `)
        .order('name')
    return data || []
}

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
    
    if (!profile?.church_id) return { error: 'Perfil sem igreja.' }
    
    const supabaseAdmin = createAdminClient()
    
    const { data, error } = await supabaseAdmin
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
    return { success: true, ministry: data }
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

// Service Times
export async function fetchAllServiceTimes() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('service_times')
        .select('*')
        .order('day_of_week')
    return data || []
}

export async function createServiceTime(dayOfWeek: string, time: string, name?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado.' }
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', user.id)
        .single()
    
    if (!profile?.church_id) return { error: 'Perfil sem igreja.' }
    
    const supabaseAdmin = createAdminClient()
    
    const { error } = await supabaseAdmin
        .from('service_times')
        .insert({
            day_of_week: dayOfWeek,
            time,
            name,
            church_id: profile.church_id
        })
    
    if (error) return { error: 'Falha ao criar horário: ' + error.message }
    
    revalidatePath('/leader')
    revalidatePath('/leader/settings')
    return { success: true }
}

export async function updateServiceTime(id: string, dayOfWeek: string, time: string, name?: string) {
    const supabaseAdmin = createAdminClient()
    
    const { error } = await supabaseAdmin
        .from('service_times')
        .update({
            day_of_week: dayOfWeek,
            time,
            name: name || null
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

// Volunteers Management
export async function fetchAllVolunteers() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select(`
            id,
            name,
            email,
            phone,
            avatar_url,
            role,
            ministry_ids
        `)
        .in('role', ['volunteer', 'leader'])
        .order('name')
    
    return data || []
}

export async function fetchLeadersForMinistry() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('role', ['leader', 'admin', 'super_admin'])
        .order('name')
    return data || []
}
