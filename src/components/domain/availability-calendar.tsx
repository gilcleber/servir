"use client"

import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { updateAvailability, fetchAvailability } from "@/actions/volunteer"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type AvailabilityStatus = 'available' | 'unavailable' | 'uninformed'

export function AvailabilityCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [availabilities, setAvailabilities] = useState<Record<string, AvailabilityStatus>>({})

    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

    useEffect(() => {
        const load = async () => {
            const data = await fetchAvailability(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            const map: Record<string, AvailabilityStatus> = {}
            data.forEach((item: any) => {
                map[item.date] = item.status
            })
            setAvailabilities(map)
        }
        load()
    }, [currentMonth])

    const handleSelect = async (date: Date | undefined) => {
        if (!date) return
        setSelectedDate(date)

        const dateStr = date.toISOString().split('T')[0]
        const currentStatus = availabilities[dateStr] || 'uninformed'

        // Cycle: uninformed -> available -> unavailable -> uninformed
        let nextStatus: AvailabilityStatus = 'available'
        if (currentStatus === 'available') nextStatus = 'unavailable'
        else if (currentStatus === 'unavailable') nextStatus = 'uninformed'
        else nextStatus = 'available'

        // Optimistic update
        setAvailabilities(prev => ({ ...prev, [dateStr]: nextStatus }))

        const result = await updateAvailability(dateStr, nextStatus)
        if (!result.success) {
            toast.error(result.error || "Erro ao atualizar disponibilidade")
            // Revert
            setAvailabilities(prev => ({ ...prev, [dateStr]: currentStatus }))
        }
    }

    return (
        <div className="border rounded-md p-4 bg-white/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Minha Disponibilidade</h3>
            <p className="text-xs text-muted-foreground mb-4">Clique nas datas para alterar (Disponível / Indisponível)</p>
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                className="rounded-md border shadow-sm w-full flex justify-center"
                onMonthChange={setCurrentMonth}
                modifiers={{
                    available: (date) => availabilities[date.toISOString().split('T')[0]] === 'available',
                    unavailable: (date) => availabilities[date.toISOString().split('T')[0]] === 'unavailable',
                }}
                modifiersClassNames={{
                    available: "bg-green-100 text-green-900 font-bold hover:bg-green-200",
                    unavailable: "bg-red-100 text-red-900 font-bold hover:bg-red-200"
                }}
            />
            <div className="mt-4 flex gap-4 text-xs justify-center">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 rounded-full border border-green-200"></div> Disponível</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 rounded-full border border-red-200"></div> Indisponível</span>
            </div>
        </div>
    )
}
