"use client"

import { Button } from "@/components/ui/button"
import { Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"

export function LeaderActions() {
    const handleNewSchedule = () => {
        // Future: Open Modal or Navigate
        toast.info("Funcionalidade 'Nova Escala' em desenvolvimento.")
    }

    const handleVolunteers = () => {
        // Future: Navigate to /admin/volunteers
        toast.info("Gestão de Voluntários em desenvolvimento.")
    }

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <Button
                onClick={handleNewSchedule}
                className="flex-1 h-12 text-base font-semibold shadow-md shadow-primary/10"
            >
                <Plus className="w-5 h-5 mr-2" /> Nova Escala
            </Button>
            <Button
                onClick={handleVolunteers}
                variant="secondary"
                className="flex-1 h-12 text-base font-semibold bg-white border"
            >
                <UserPlus className="w-5 h-5 mr-2" /> Voluntários
            </Button>
        </div>
    )
}
