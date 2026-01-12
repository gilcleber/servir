import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { fetchAllMinistries, fetchAllServiceTimes, fetchLeadersForMinistry } from "@/actions/ministry"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
    const user = await getUser()
    if (!user) redirect('/login/leader')

    const ministries = await fetchAllMinistries()
    const serviceTimes = await fetchAllServiceTimes()
    const leaders = await fetchLeadersForMinistry()

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DashboardHeader
                userEmail={user.email}
                userName={user.user_metadata?.name}
                role={user.user_metadata?.role}
            />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Configurações</h1>
                    <p className="text-muted-foreground">Gerencie ministérios e horários de culto da sua igreja.</p>
                </div>

                <SettingsClient
                    ministries={ministries}
                    serviceTimes={serviceTimes}
                    leaders={leaders}
                />
            </main>
        </div>
    )
}
