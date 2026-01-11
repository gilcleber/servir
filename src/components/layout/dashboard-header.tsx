"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Settings } from "lucide-react"
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

    return (
        <header className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-white rounded-full opacity-50" />
                </div>
                <span className="font-bold text-lg text-primary">Servir</span>
            </div>

            <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost"><Bell className="w-5 h-5" /></Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 bg-pink-500">
                                <AvatarFallback>{initials}</AvatarFallback>
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
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configurações</span>
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
