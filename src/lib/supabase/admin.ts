import { createClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE ROLE key.
// It bypasses RLS. Use ONLY in server-side logic (Server Actions/Route Handlers).
// NEVER expose this client to the browser.
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
