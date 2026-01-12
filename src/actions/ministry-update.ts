
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateMinistryLeaders(ministryId: string, leaderIds: string[]) {
    const supabaseAdmin = createAdminClient()

    // 1. Get all leaders who CURRENTLY have this ministry
    // We need to remove the ministry from those who are NOT in leaderIds
    const { data: currentLeaders } = await supabaseAdmin
        .from('profiles')
        .select('id, ministry_ids')
        .contains('ministry_ids', [ministryId])

    // 2. Remove ministry from removed leaders
    if (currentLeaders) {
        for (const leader of currentLeaders) {
            if (!leaderIds.includes(leader.id)) {
                const newIds = (leader.ministry_ids || []).filter((id: string) => id !== ministryId)
                await supabaseAdmin.from('profiles').update({ ministry_ids: newIds }).eq('id', leader.id)
            }
        }
    }

    // 3. Add ministry to new leaders
    // fetch their current ids first to append
    for (const leaderId of leaderIds) {
        const { data: leader } = await supabaseAdmin.from('profiles').select('ministry_ids').eq('id', leaderId).single()
        if (leader) {
            const currentIds = leader.ministry_ids || []
            if (!currentIds.includes(ministryId)) {
                await supabaseAdmin.from('profiles').update({ ministry_ids: [...currentIds, ministryId] }).eq('id', leaderId)
            }
        }
    }

    revalidatePath('/leader/settings')
    revalidatePath('/leader/volunteers')
    return { success: true }
}
