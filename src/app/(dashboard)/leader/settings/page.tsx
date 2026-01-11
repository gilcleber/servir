import { DashboardHeader } from "@/components/layout/dashboard-header"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"
import { fetchAllMinistries, fetchAllServiceTimes, fetchLeadersForMinistry } from "@/actions/ministry"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()
    
    const ministries = await fetchAllMinistries()
    const serviceTimes = await fetchAllServiceTimes()
    const leaders = await fetchLeadersForMinistry()
    
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user?.email}
                userName={profile?.name || 'Líder'}
                role="leader"
            />
            
            <main className="p-4 md:p-6 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Configurações</h1>
                
                <SettingsClient 
                    ministries={ministries} 
                    serviceTimes={serviceTimes}
                    leaders={leaders}
                />
            </main>
        </div>
    )
}
