"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RefreshCw, Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { suggestSubstitutes } from "@/actions/ai-substitute"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function ScheduleListClient({ schedules }: { schedules: any[] }) {
    const [isAIThinking, setIsAIThinking] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null)
    const [aiReasoning, setAiReasoning] = useState("")

    const handleSubstitute = async (scheduleId: string, ministryId: string, assignmentId: string) => {
        setIsAIThinking(true)
        setActiveAssignmentId(assignmentId)
        try {
            const result = await suggestSubstitutes(scheduleId, ministryId)
            setSuggestions(result.candidates)
            setAiReasoning(result.reasoning)
            setShowModal(true)
        } catch (e) {
            toast.error("Erro ao buscar sugestões")
        } finally {
            setIsAIThinking(false)
        }
    }

    const handleInvite = (candidateId: string) => {
        toast.success("Convite enviado com sucesso!")
        setShowModal(false)
        // Here we would call another Server Action to create/update assignment
    }

    return (
        <div className="space-y-4">
            {schedules.map((schedule: any) => (
                <Card key={schedule.id} className="border-0 shadow-sm mb-4">
                    <CardContent className="p-0">
                        <div className="p-4 border-b bg-gray-50/50">
                            <h3 className="font-semibold text-lg">{schedule.ministries?.name}</h3>
                            <p className="text-sm text-muted-foreground">{schedule.date} • {schedule.service_times?.time}</p>
                        </div>

                        <div className="divide-y text-left">
                            {schedule.assignments.map((assignment: any) => (
                                <div key={assignment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarFallback className="bg-gray-100 text-xs font-bold">
                                                {assignment.profiles?.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{assignment.profiles?.name || 'Voluntário'}</p>
                                            <p className="text-xs text-muted-foreground">{assignment.profiles?.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={assignment.status} />

                                        {assignment.status === 'declined' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-primary border-primary/20"
                                                onClick={() => handleSubstitute(schedule.id, schedule.ministry_id, assignment.id)}
                                                disabled={isAIThinking}
                                            >
                                                {isAIThinking && activeAssignmentId === assignment.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                                Substituir (IA)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sugestões Inteligentes</DialogTitle>
                        <DialogDescription>
                            {aiReasoning}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {suggestions.map(candidate => (
                            <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{candidate.name}</span>
                                </div>
                                <Button size="sm" onClick={() => handleInvite(candidate.id)}>Convidar</Button>
                            </div>
                        ))}
                        {suggestions.length === 0 && <p className="text-sm text-center text-muted-foreground">Nenhum candidato encontrado.</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed') return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">Confirmado</span>
    if (status === 'pending') return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">Pendente</span>
    if (status === 'declined') return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">Recusado</span>
    return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">Cancelado</span>
}
