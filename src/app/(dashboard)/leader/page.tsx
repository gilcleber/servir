import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchLeaderStats, fetchActiveSchedules } from "@/actions/leader"
import { createClient } from "@/lib/supabase/server"
import { ScheduleListClient } from "./schedule-list-client"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { LeaderActions } from "@/components/domain/leader-actions"

export default async function LeaderDashboard() {
    const stats = await fetchLeaderStats()
    const activeSchedules = await fetchActiveSchedules()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile for name
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user?.email}
                userName={profile?.name || 'Líder'}
                role="leader"
            />

            <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8">
                {/* Welcome */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-pink-500">
                        <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || 'LD'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold text-xl">Olá, {profile?.name || 'Líder'}!</h1>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-white shadow-sm border-0">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600 font-bold text-xl">{stats.confirmed}</div>
                                <span className="text-sm font-medium text-muted-foreground">Confirmados</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-white shadow-sm border-0">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 font-bold text-xl">{stats.pending}</div>
                                <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white shadow-sm border-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Taxa de Confirmação</span>
                                <span className="font-bold text-primary">{stats.confirmationRate}%</span>
                            </div>
                            <Progress value={stats.confirmationRate} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">{stats.confirmed} confirmados de {stats.confirmed + stats.pending} totais</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <LeaderActions userEmail={user.email} role={user.user_metadata?.role} />

                {/* Active Schedules */}
                <section>
                    <h2 className="font-bold text-lg mb-4">Escalas Ativas</h2>
                    {activeSchedules.length === 0 ? <p className="text-muted-foreground">Nenhuma escala ativa.</p> : null}

                    <ScheduleListClient schedules={activeSchedules} />
                </section>
            </main>
        </div>
    )
}
