"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Settings, ChevronLeft, Home } from "lucide-react"
import { logout } from "@/actions/auth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
    userEmail?: string | null
    userName?: string
    role?: string
}

export function DashboardHeader({ userEmail, userName, role }: DashboardHeaderProps) {
    const initials = userName?.substring(0, 2).toUpperCase() || "US"
    const pathname = usePathname()

    // Determine if we're on a sub-page (not main dashboard)
    const isLeaderSubPage = pathname?.startsWith('/leader/') && pathname !== '/leader'
    const isVolunteerSubPage = pathname?.startsWith('/volunteer/') && pathname !== '/volunteer'
    const isSubPage = isLeaderSubPage || isVolunteerSubPage

    // Get the base path for back button
    const basePath = role === 'volunteer' ? '/volunteer' : '/leader'

    return (
        <header className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
                {isSubPage ? (
                    <Link href={basePath}>
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Voltar</span>
                        </Button>
                    </Link>
                ) : null}

                <Link href={basePath} className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <Home className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg text-primary">Servir</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost"><Bell className="w-5 h-5" /></Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 bg-primary/20">
                                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/leader/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configurações</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
