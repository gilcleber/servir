'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchLeaderStats() {
    const supabase = await createClient()

    // In a real app, strict filtering by hierarchy/ministry
    // MVP: Count all assignments mostly

    // Confirmed
    const { count: confirmed } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')

    // Pending
    const { count: pending } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const total = (confirmed || 0) + (pending || 0)
    const rate = total > 0 ? Math.round(((confirmed || 0) / total) * 100) : 0

    return {
        confirmed: confirmed || 0,
        pending: pending || 0,
        confirmationRate: rate
    }
}

export async function fetchActiveSchedules() {
    // Determine "Active" (e.g. today or next Sunday)
    // MVP: Fetch next 3 assignments with details
    const supabase = await createClient()

    const { data } = await supabase
        .from('schedules')
        .select(`
            *,
            ministries(*),
            service_times(*),
            assignments(
                *,
                profiles(name, role, avatar_url)
            )
        `)
        .order('date', { ascending: true })
        .limit(3)

    return data || []
}
