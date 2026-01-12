import { Home, Calendar, Bell, User } from "lucide-react"
import Link from "next/link"

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
            <main className="flex-1 pb-24">
                {children}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center px-4 z-50">
                <Link href="/volunteer" className="flex flex-col items-center text-primary text-xs gap-1 font-medium">
                    <Home className="w-6 h-6" />
                    Início
                </Link>
                <Link href="/volunteer" className="flex flex-col items-center text-primary text-xs gap-1 font-medium">
                    <Calendar className="w-6 h-6" />
                    Escalas
                </Link>
                <Link href="/volunteer/alerts" className="flex flex-col items-center text-gray-400 hover:text-primary text-xs gap-1 font-medium transition-colors">
                    <Bell className="w-6 h-6" />
                    Alertas
                </Link>
                <Link href="/volunteer/profile" className="flex flex-col items-center text-gray-400 hover:text-primary text-xs gap-1 font-medium transition-colors">
                    <User className="w-6 h-6" />
                    Perfil
                </Link>
            </nav>
        </div>
    )
}
