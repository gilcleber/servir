import { DashboardHeader } from "@/components/layout/dashboard-header"
import { createClient } from "@/lib/supabase/server"
import { VolunteersClient } from "./volunteers-client"
import { fetchAllVolunteers, fetchAllMinistries } from "@/actions/ministry"

export default async function VolunteersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('name, church_id').eq('id', user?.id).single()
    
    const volunteers = await fetchAllVolunteers()
    const ministries = await fetchAllMinistries()
    
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user?.email}
                userName={profile?.name || 'Líder'}
                role="leader"
            />
            
            <main className="p-4 md:p-6 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Voluntários</h1>
                
                <VolunteersClient 
                    volunteers={volunteers} 
                    ministries={ministries}
                    churchId={profile?.church_id}
                />
            </main>
        </div>
    )
}
