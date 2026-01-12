import { DashboardHeader } from "@/components/layout/dashboard-header"
import { createClient } from "@/lib/supabase/server"
import { NewScheduleClient } from "./new-schedule-client"
import { fetchMinistries, fetchServiceTimes } from "@/actions/schedule"

export default async function NewSchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch full profile including ministry_ids
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

    let ministries = await fetchMinistries()
    const serviceTimes = await fetchServiceTimes()

    // Filter ministries if not Pastor/Admin
    const isPastor = user?.email === 'gilcleberlocutor@gmail.com'
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    if (!isPastor && !isAdmin && profile?.role === 'leader') {
        const myMinistryIds = profile.ministry_ids || []
        ministries = ministries.filter((m: any) => myMinistryIds.includes(m.id))
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user?.email}
                userName={profile?.name || 'Líder'}
                role="leader"
            />

            <main className="p-4 md:p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Nova Escala</h1>

                <NewScheduleClient
                    ministries={ministries}
                    serviceTimes={serviceTimes}
                />
            </main>
        </div>
    )
}
