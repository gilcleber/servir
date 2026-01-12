"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, UserPlus, Church, CalendarPlus } from "lucide-react"

export function LeaderActions() {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Primary Action for Senior Pastor: Manage Ministries */}
            <Button asChild className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/10">
                <Link href="/leader/settings">
                    <Church className="w-5 h-5 mr-2" /> Ministérios
                </Link>
            </Button>

            {/* Secondary Actions */}
            <Button asChild variant="outline" className="flex-1 h-12 text-base font-semibold bg-white border">
                <Link href="/leader/new-schedule">
                    <CalendarPlus className="w-5 h-5 mr-2" /> Nova Escala
                </Link>
            </Button>

            <Button asChild variant="secondary" className="flex-1 h-12 text-base font-semibold bg-white border">
                <Link href="/leader/volunteers">
                    <UserPlus className="w-5 h-5 mr-2" /> Voluntários
                </Link>
            </Button>
        </div>
    )
}

