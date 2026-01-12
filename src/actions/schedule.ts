'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function fetchMinistries() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('ministries')
        .select('id, name')
        .order('name')
    return data || []
}

export async function fetchServiceTimes() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('service_times')
        .select('id, day_of_week, time, name')
        .order('day_of_week')
    return data || []
}

export async function fetchVolunteersForMinistry(ministryId: string, date: string) {
    const supabaseAdmin = createAdminClient()

    // 1. Get volunteers in this ministry
    const { data: volunteers } = await supabaseAdmin
        .from('profiles')
        .select('id, name, avatar_url, ministry_ids')
        .eq('role', 'volunteer')
        .contains('ministry_ids', [ministryId])

    if (!volunteers || volunteers.length === 0) return []

    // 2. Get availability for this date
    const { data: availabilities } = await supabaseAdmin
        .from('availability')
        .select('profile_id, status')
        .eq('date', date)
        .in('profile_id', volunteers.map(v => v.id))

    const availMap = new Map(availabilities?.map(a => [a.profile_id, a.status]) || [])

    // 3. Check existing assignments for this date
    const { data: schedules } = await supabaseAdmin
        .from('schedules')
        .select('id')
        .eq('date', date)

    const scheduleIds = schedules?.map(s => s.id) || []

    let assignedProfileIds: string[] = []
    if (scheduleIds.length > 0) {
        const { data: assignments } = await supabaseAdmin
            .from('assignments')
            .select('profile_id')
            .in('schedule_id', scheduleIds)
            .in('status', ['pending', 'confirmed'])
        assignedProfileIds = assignments?.map(a => a.profile_id) || []
    }

    // 4. Return enriched list
    return volunteers.map(v => ({
        ...v,
        availability: availMap.get(v.id) || 'uninformed',
        alreadyAssigned: assignedProfileIds.includes(v.id)
    }))
}

export async function createSchedule(
    ministryId: string,
    date: string,
    serviceTimeId: string,
    volunteerIds: string[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado.' }

    // Get profile for church_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, church_id')
        .eq('id', user.id)
        .single()

    if (!profile?.church_id) return { error: 'Perfil sem igreja vinculada.' }

    const supabaseAdmin = createAdminClient()

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabaseAdmin
        .from('schedules')
        .insert({
            church_id: profile.church_id,
            ministry_id: ministryId,
            date,
            service_time_id: serviceTimeId,
            created_by_profile_id: profile.id
        })
        .select()
        .single()

    if (scheduleError || !schedule) {
        return { error: 'Falha ao criar escala: ' + scheduleError?.message }
    }

    // Create assignments for each volunteer
    if (volunteerIds.length > 0) {
        const assignments = volunteerIds.map(profileId => ({
            schedule_id: schedule.id,
            profile_id: profileId,
            status: 'pending' as const
        }))

        const { error: assignError } = await supabaseAdmin
            .from('assignments')
            .insert(assignments)

        if (assignError) {
            return { error: 'Escala criada mas erro ao atribuir voluntários: ' + assignError.message }
        }
    }

    revalidatePath('/leader')
    return { success: true, scheduleId: schedule.id }
}

export async function resendInvite(assignmentId: string) {
    // For now just reset status to pending (simulating resend)
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
        .from('assignments')
        .update({ status: 'pending', confirmed_at: null, declined_at: null })
        .eq('id', assignmentId)

    if (error) return { error: 'Falha ao reenviar convite.' }

    revalidatePath('/leader')
    return { success: true }
}

export async function assignSubstitute(scheduleId: string, newProfileId: string, oldAssignmentId?: string) {
    const supabaseAdmin = createAdminClient()

    // Cancel old assignment if provided
    if (oldAssignmentId) {
        await supabaseAdmin
            .from('assignments')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('id', oldAssignmentId)
    }

    // Create new assignment
    const { error } = await supabaseAdmin
        .from('assignments')
        .insert({
            schedule_id: scheduleId,
            profile_id: newProfileId,
            status: 'pending'
        })

    if (error) return { error: 'Falha ao atribuir substituto.' }

    revalidatePath('/leader')
    return { success: true }
}

export async function createServiceTime(day: string, time: string, name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // Ideally check if leader/admin

    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()

    if (!profile?.church_id) return { error: 'Igreja não encontrada' }

    const { data, error } = await supabaseAdmin
        .from('service_times')
        .insert({
            church_id: profile.church_id,
            day_of_week: day,
            time,
            name
        })
        .select()
        .single()

    if (error) return { error: 'Erro ao criar horário: ' + error.message }

    revalidatePath('/leader/new-schedule')
    return { success: true, id: data.id }
}
