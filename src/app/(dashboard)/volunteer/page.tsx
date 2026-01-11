import { AvailabilityCalendar } from "@/components/domain/availability-calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchVolunteerAssignments } from "@/actions/volunteer"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default async function VolunteerDashboard() {
    const assignments = await fetchVolunteerAssignments()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get simpler name (First Name)
    const { data: profile } = await supabase.from('profiles').select('name').eq('email', user?.email || '').single()

    const firstName = profile?.name?.split(' ')[0] || 'Voluntário'
    const initials = firstName.substring(0, 2).toUpperCase()

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user?.email}
                userName={firstName}
                role="volunteer"
            />

            <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
                {/* Header Profile Area (optional duplication, can simplify) */}
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarFallback className="bg-orange-500 text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Olá, {firstName}!</h1>
                            <p className="text-xs text-muted-foreground">Suas Escalas</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Next Schedules */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg">Próximas Escalas</h2>
                        </div>

                        {assignments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nenhuma escala agendada.</p>
                        ) : (
                            <DashboardClient assignments={assignments} />
                        )}
                    </section>

                    {/* Availability */}
                    <section>
                        <AvailabilityCalendar />
                    </section>
                </div>
            </main>
        </div>
    )
}
