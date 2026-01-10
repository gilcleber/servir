import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bell, Settings, Plus, UserPlus } from "lucide-react"
import { fetchLeaderStats, fetchActiveSchedules } from "@/actions/leader"
import { createClient } from "@/lib/supabase/server"
import { ScheduleListClient } from "./schedule-list-client" // Client component for interactivity

export default async function LeaderDashboard() {
    const stats = await fetchLeaderStats()
    const activeSchedules = await fetchActiveSchedules()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Top Bar */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <div className="w-4 h-4 bg-white rounded-full opacity-50" />
                    </div>
                    <span className="font-bold text-lg text-primary">Servir</span>
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost"><Bell className="w-5 h-5" /></Button>
                    <Button size="icon" variant="ghost"><Settings className="w-5 h-5" /></Button>
                </div>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Welcome */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-pink-500">
                        <AvatarFallback>LD</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold text-xl">Olá, Líder!</h1>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                {/* Stats */}
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

                    <Card className="col-span-2 bg-white shadow-sm border-0">
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
                <div className="flex gap-4">
                    <Button className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/10">
                        <Plus className="w-5 h-5 mr-2" /> Nova Escala
                    </Button>
                    <Button variant="secondary" className="flex-1 h-12 text-base font-semibold bg-white border">
                        <UserPlus className="w-5 h-5 mr-2" /> Voluntários
                    </Button>
                </div>

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
