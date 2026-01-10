import { AvailabilityCalendar } from "@/components/domain/availability-calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { fetchVolunteerAssignments } from "@/actions/volunteer"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function VolunteerDashboard() {
    const assignments = await fetchVolunteerAssignments()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get simpler name (First Name)
    const { data: profile } = await supabase.from('profiles').select('name').eq('email', user?.email || '').single()

    const firstName = profile?.name?.split(' ')[0] || 'Voluntário'

    return (
        <div className="p-6 max-w-lg mx-auto space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-orange-500 text-white">{firstName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Olá, {firstName}!</h1>
                        <p className="text-xs text-muted-foreground">Suas Escalas</p>
                    </div>
                </div>
                <Button size="icon" variant="ghost" className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /> */}
                </Button>
            </header>

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
    )
}
