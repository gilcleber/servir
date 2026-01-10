'use server'

import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function createVolunteer(name: string, email: string | null, ministries: string[], churchId: string) {
    const supabase = await createClient()

    // 1. Generate 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const pinHash = createHash('sha256').update(pin).digest('hex')

    // 2. Create Profile
    // Note: Ideally we create Auth User first but for MVP/Pin-based we might just create Profile
    // AND create a shadow auth user if we want full RLS.
    // For now, let's insert into profiles. RLS might block if not generic 'admin_role'.
    // We assume the logged in user is Leader/Admin.

    const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
            church_id: churchId,
            name,
            email,
            role: 'volunteer',
            pin: pinHash, // Storing hashed
            ministry_ids: ministries
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // 3. Return the PIN so the admin can give it to the volunteer
    return { success: true, pin, profile }
}
