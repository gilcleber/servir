import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Schedule, Assignment } from "@/types"
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleCardProps {
    schedule: Schedule
    assignment: Assignment | null
    onConfirm?: () => void
    onDecline?: () => void
    onCancel?: () => void
    isVolunteer?: boolean
}

export function ScheduleCard({
    schedule,
    assignment,
    onConfirm,
    onDecline,
    onCancel,
    isVolunteer = true
}: ScheduleCardProps) {

    const status = assignment?.status || 'pending';

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        confirmed: "bg-green-100 text-green-800 hover:bg-green-200",
        declined: "bg-red-100 text-red-800 hover:bg-red-200",
        cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    }

    const statusLabels = {
        pending: "Pendente",
        confirmed: "Confirmado",
        declined: "Recusado",
        cancelled: "Cancelado"
    }

    return (
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge className={cn("mb-2", statusColors[status as keyof typeof statusColors])} variant="outline">
                        {statusLabels[status as keyof typeof statusLabels]}
                    </Badge>
                    {/* Date formatted: e.g. "Domingo, 12 Jan" */}
                    <span className="text-sm font-medium text-muted-foreground">{schedule.date}</span>
                </div>
                <CardTitle className="text-xl font-bold">{schedule.ministries?.name || 'Ministério'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{schedule.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ClockIcon className="w-4 h-4" />
                        <span>{schedule.service_times?.time || '00:00'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{schedule.service_times?.name || 'Templo Principal'}</span>
                    </div>
                </div>

                {isVolunteer && status === 'pending' && (
                    <div className="flex gap-2 w-full">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onConfirm}>
                            Confirmar
                        </Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" variant="outline" onClick={onDecline}>
                            Recusar
                        </Button>
                    </div>
                )}

                {isVolunteer && status === 'confirmed' && (
                    <Button className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" variant="outline" onClick={onCancel}>
                        Cancelar Escala
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
