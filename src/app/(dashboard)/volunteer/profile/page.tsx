
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default async function ProfilePage() {
    const user = await getUser()
    if (!user) redirect('/login/volunteer')

    const initials = user.user_metadata?.name?.substring(0, 2).toUpperCase() || "VO"

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <DashboardHeader
                userEmail={user.email}
                userName={user.user_metadata?.name || 'Voluntário'}
                role="volunteer"
            />
            <main className="p-4 md:p-8 max-w-md mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Meu Perfil</h1>

                <Card>
                    <CardHeader className="flex flex-col items-center pb-2">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarFallback className="text-2xl bg-primary text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{user.user_metadata?.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Voluntário</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input value={user.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Igreja</Label>
                            <Input value="Minha Igreja" disabled />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
