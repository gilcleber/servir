"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Church, Clock, Users } from "lucide-react"
import { toast } from "sonner"
import { createMinistry, deleteMinistry, createServiceTime, deleteServiceTime } from "@/actions/ministry"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SettingsClientProps {
    ministries: any[]
    serviceTimes: any[]
    leaders: any[]
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function SettingsClient({ ministries, serviceTimes, leaders }: SettingsClientProps) {
    const [showMinistryModal, setShowMinistryModal] = useState(false)
    const [showServiceTimeModal, setShowServiceTimeModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Ministry form
    const [ministryName, setMinistryName] = useState("")
    const [ministryDesc, setMinistryDesc] = useState("")
    const [ministryLeader, setMinistryLeader] = useState("")
    
    // Service time form
    const [stDay, setStDay] = useState("Domingo")
    const [stTime, setStTime] = useState("09:00")
    const [stName, setStName] = useState("")
    
    const handleCreateMinistry = async () => {
        if (!ministryName.trim()) {
            toast.error("Nome é obrigatório")
            return
        }
        setIsLoading(true)
        const result = await createMinistry(ministryName, ministryDesc, ministryLeader || undefined)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Ministério criado!")
            setShowMinistryModal(false)
            setMinistryName("")
            setMinistryDesc("")
            setMinistryLeader("")
        }
        setIsLoading(false)
    }
    
    const handleDeleteMinistry = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este ministério?")) return
        const result = await deleteMinistry(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Ministério excluído!")
        }
    }
    
    const handleCreateServiceTime = async () => {
        setIsLoading(true)
        const result = await createServiceTime(stDay, stTime, stName || undefined)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Horário criado!")
            setShowServiceTimeModal(false)
            setStTime("09:00")
            setStName("")
        }
        setIsLoading(false)
    }
    
    const handleDeleteServiceTime = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este horário?")) return
        const result = await deleteServiceTime(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Horário excluído!")
        }
    }
    
    return (
        <Tabs defaultValue="ministries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="ministries" className="text-base">
                    <Church className="w-4 h-4 mr-2" /> Ministérios
                </TabsTrigger>
                <TabsTrigger value="service-times" className="text-base">
                    <Clock className="w-4 h-4 mr-2" /> Horários de Culto
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ministries" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Ministérios ({ministries.length})</h2>
                    <Button onClick={() => setShowMinistryModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Ministério
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ministries.map((m) => (
                        <Card key={m.id} className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{m.name}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteMinistry(m.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {m.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
                                )}
                                {m.leader && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">{m.leader.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-muted-foreground">Líder: {m.leader.name}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    
                    {ministries.length === 0 && (
                        <p className="text-muted-foreground col-span-2 text-center py-8">
                            Nenhum ministério cadastrado. Clique em "Novo Ministério" para começar.
                        </p>
                    )}
                </div>
            </TabsContent>
            
            <TabsContent value="service-times" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Horários de Culto ({serviceTimes.length})</h2>
                    <Button onClick={() => setShowServiceTimeModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Horário
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceTimes.map((st) => (
                        <Card key={st.id} className="border-0 shadow-sm">
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{st.day_of_week}</p>
                                        <p className="text-2xl font-bold text-primary">{st.time}</p>
                                        {st.name && <p className="text-sm text-muted-foreground">{st.name}</p>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteServiceTime(st.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {serviceTimes.length === 0 && (
                        <p className="text-muted-foreground col-span-3 text-center py-8">
                            Nenhum horário cadastrado. Clique em "Novo Horário" para começar.
                        </p>
                    )}
                </div>
            </TabsContent>
            
            {/* Ministry Modal */}
            <Dialog open={showMinistryModal} onOpenChange={setShowMinistryModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Ministério</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome *</Label>
                            <Input
                                value={ministryName}
                                onChange={(e) => setMinistryName(e.target.value)}
                                placeholder="Ex: Louvor, Mídia, Recepção..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={ministryDesc}
                                onChange={(e) => setMinistryDesc(e.target.value)}
                                placeholder="Descrição do ministério..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Líder Responsável</Label>
                            <Select value={ministryLeader} onValueChange={setMinistryLeader}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um líder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaders.map((l) => (
                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMinistryModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateMinistry} disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar Ministério"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Service Time Modal */}
            <Dialog open={showServiceTimeModal} onOpenChange={setShowServiceTimeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Horário de Culto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Dia da Semana *</Label>
                            <Select value={stDay} onValueChange={setStDay}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Horário *</Label>
                            <Input
                                type="time"
                                value={stTime}
                                onChange={(e) => setStTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nome/Descrição (opcional)</Label>
                            <Input
                                value={stName}
                                onChange={(e) => setStName(e.target.value)}
                                placeholder="Ex: Culto da Manhã, Célula..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowServiceTimeModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateServiceTime} disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar Horário"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Tabs>
    )
}
