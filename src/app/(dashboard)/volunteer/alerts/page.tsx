
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function AlertsPage() {
    const user = await getUser()
    if (!user) redirect('/login/volunteer')

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user.email}
                userName={user.user_metadata?.name || 'Voluntário'}
                role="volunteer"
            />
            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Meus Alertas</h1>
                <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-muted-foreground">
                    <p>Você não tem novos alertas.</p>
                </div>
            </main>
        </div>
    )
}
