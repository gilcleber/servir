"use client"

import { ScheduleCard } from "@/components/domain/schedule-card"
import { updateAssignmentStatus } from "@/actions/volunteer"
import { toast } from "sonner"
import { useState } from "react"

export default function DashboardClient({ assignments }: { assignments: any[] }) {
    // Optimistic UI could be added here, but for MVP plain reload/server action is fine.

    const handleAction = async (assignmentId: string, action: 'confirmed' | 'declined' | 'pending') => {
        const result = await updateAssignmentStatus(assignmentId, action)
        if (result.success) {
            toast.success("Status atualizado!")
        } else {
            toast.error("Erro ao atualizar status.")
        }
    }

    return (
        <div className="space-y-4">
            {assignments.map((item) => (
                <ScheduleCard
                    key={item.id}
                    // We need to map the flat structure back to expected props?
                    // The API returns 'schedule' nested.
                    schedule={{
                        ...item.schedule,
                        ministries: item.schedule.ministry, // Mapping mismatch fix
                        service_times: item.schedule.service_time
                    }}
                    assignment={item}
                    isVolunteer={true}
                    onConfirm={() => handleAction(item.id, 'confirmed')}
                    onDecline={() => handleAction(item.id, 'declined')}
                    onCancel={() => handleAction(item.id, 'pending')} // Cancel = Back to Pending? Or 'declined'? Usually 'declined' releases the spot. But 'cancel' implies "I can't go anymore". Let's set 'declined' or specific logic. For now 'declined'.
                // Wait, previous UI says "Cancelar Escala". Usually means "I was confirmed, now I decline".
                />
            ))}
        </div>
    )
}
