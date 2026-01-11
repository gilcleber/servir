"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, UserPlus, Settings } from "lucide-react"

export function LeaderActions() {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <Button asChild className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/10">
                <Link href="/leader/new-schedule">
                    <Plus className="w-5 h-5 mr-2" /> Nova Escala
                </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1 h-12 text-base font-semibold bg-white border">
                <Link href="/leader/volunteers">
                    <UserPlus className="w-5 h-5 mr-2" /> Voluntários
                </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12 text-base font-semibold">
                <Link href="/leader/settings">
                    <Settings className="w-5 h-5 mr-2" /> Configurações
                </Link>
            </Button>
        </div>
    )
}
