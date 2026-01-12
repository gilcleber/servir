import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { fetchAllMinistries, fetchAllVolunteers } from "@/actions/ministry"
import { VolunteersClient } from "./volunteers-client"
import { createClient } from "@/lib/supabase/server"

export default async function VolunteersPage() {
    const user = await getUser()
    if (!user) redirect('/login/leader')

    const supabase = await createClient()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const volunteers = await fetchAllVolunteers()
    const ministries = await fetchAllMinistries()

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DashboardHeader
                userEmail={user.email}
                userName={user.user_metadata?.name}
                role={user.user_metadata?.role}
            />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Voluntários e Líderes</h1>
                    <p className="text-muted-foreground">Gerencie todos os membros da sua equipe.</p>
                </div>

                <VolunteersClient
                    volunteers={volunteers}
                    ministries={ministries}
                    churchId={profile?.church_id}
                    currentUser={profile}
                />
            </main>
        </div>
    )
}
