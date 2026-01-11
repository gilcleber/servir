"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { fetchVolunteersForMinistry, createSchedule } from "@/actions/schedule"
import { cn } from "@/lib/utils"

interface NewScheduleClientProps {
    ministries: any[]
    serviceTimes: any[]
}

type Step = 1 | 2 | 3

export function NewScheduleClient({ ministries, serviceTimes }: NewScheduleClientProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    
    // Step 1
    const [selectedMinistry, setSelectedMinistry] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedServiceTime, setSelectedServiceTime] = useState("")
    
    // Step 2
    const [volunteers, setVolunteers] = useState<any[]>([])
    const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
    
    const canProceedStep1 = selectedMinistry && selectedDate && selectedServiceTime
    
    useEffect(() => {
        if (step === 2 && selectedMinistry && selectedDate) {
            loadVolunteers()
        }
    }, [step])
    
    const loadVolunteers = async () => {
        setIsLoading(true)
        const dateStr = selectedDate!.toISOString().split('T')[0]
        const data = await fetchVolunteersForMinistry(selectedMinistry, dateStr)
        setVolunteers(data)
        setIsLoading(false)
    }
    
    const toggleVolunteer = (id: string) => {
        setSelectedVolunteers(prev => 
            prev.includes(id) 
                ? prev.filter(v => v !== id)
                : [...prev, id]
        )
    }
    
    const handleCreate = async () => {
        if (selectedVolunteers.length === 0) {
            toast.error("Selecione pelo menos um voluntário")
            return
        }
        
        setIsCreating(true)
        const dateStr = selectedDate!.toISOString().split('T')[0]
        const result = await createSchedule(selectedMinistry, dateStr, selectedServiceTime, selectedVolunteers)
        
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Escala criada com sucesso!")
            router.push('/leader')
        }
        setIsCreating(false)
    }
    
    const getAvailabilityIcon = (status: string) => {
        if (status === 'available') return <CheckCircle2 className="w-4 h-4 text-green-600" />
        if (status === 'unavailable') return <XCircle className="w-4 h-4 text-red-600" />
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
    
    const getAvailabilityLabel = (status: string) => {
        if (status === 'available') return 'Disponível'
        if (status === 'unavailable') return 'Indisponível'
        return 'Não informado'
    }
    
    const ministryName = ministries.find(m => m.id === selectedMinistry)?.name
    const serviceTime = serviceTimes.find(s => s.id === selectedServiceTime)
    
    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                            step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                        )}>
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && <div className={cn("w-12 h-1 mx-1", step > s ? "bg-primary" : "bg-gray-200")} />}
                    </div>
                ))}
            </div>
            
            {/* Step 1: Select Ministry, Date, Time */}
            {step === 1 && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Passo 1: Detalhes da Escala</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Ministério *</Label>
                            <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ministério" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ministries.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {ministries.length === 0 && (
                                <p className="text-xs text-red-500">Cadastre ministérios em Configurações primeiro.</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Data *</Label>
                            <div className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border"
                                    disabled={(date) => date < new Date()}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Horário do Culto *</Label>
                            <Select value={selectedServiceTime} onValueChange={setSelectedServiceTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o horário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceTimes.map((st) => (
                                        <SelectItem key={st.id} value={st.id}>
                                            {st.day_of_week} - {st.time} {st.name && `(${st.name})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {serviceTimes.length === 0 && (
                                <p className="text-xs text-red-500">Cadastre horários em Configurações primeiro.</p>
                            )}
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                                Próximo <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Step 2: Select Volunteers */}
            {step === 2 && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Passo 2: Selecionar Voluntários</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {ministryName} • {selectedDate?.toLocaleDateString('pt-BR')} • {serviceTime?.time}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : volunteers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-12">
                                Nenhum voluntário cadastrado neste ministério.
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {volunteers.map((v) => (
                                    <div 
                                        key={v.id}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                            selectedVolunteers.includes(v.id) ? "border-primary bg-primary/5" : "hover:bg-gray-50",
                                            v.alreadyAssigned && "opacity-50"
                                        )}
                                        onClick={() => !v.alreadyAssigned && toggleVolunteer(v.id)}
                                    >
                                        <Checkbox 
                                            checked={selectedVolunteers.includes(v.id)}
                                            disabled={v.alreadyAssigned}
                                        />
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{v.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium">{v.name}</p>
                                            <div className="flex items-center gap-2">
                                                {getAvailabilityIcon(v.availability)}
                                                <span className="text-xs text-muted-foreground">
                                                    {getAvailabilityLabel(v.availability)}
                                                </span>
                                            </div>
                                        </div>
                                        {v.alreadyAssigned && (
                                            <Badge variant="secondary" className="text-[10px]">Já escalado</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                            <Button onClick={() => setStep(3)} disabled={selectedVolunteers.length === 0}>
                                Próximo <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Step 3: Confirm */}
            {step === 3 && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Passo 3: Confirmar Escala</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ministério:</span>
                                <span className="font-medium">{ministryName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data:</span>
                                <span className="font-medium">{selectedDate?.toLocaleDateString('pt-BR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long' 
                                })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Horário:</span>
                                <span className="font-medium">{serviceTime?.day_of_week} às {serviceTime?.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Voluntários:</span>
                                <span className="font-medium">{selectedVolunteers.length} selecionados</span>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium mb-2">Voluntários escalados:</p>
                            <div className="flex flex-wrap gap-2">
                                {volunteers
                                    .filter(v => selectedVolunteers.includes(v.id))
                                    .map(v => (
                                        <Badge key={v.id} variant="secondary" className="py-1">
                                            {v.name}
                                        </Badge>
                                    ))
                                }
                            </div>
                        </div>
                        
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                            <Button onClick={handleCreate} disabled={isCreating}>
                                {isCreating ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
                                ) : (
                                    <><Check className="w-4 h-4 mr-2" /> Criar Escala</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
