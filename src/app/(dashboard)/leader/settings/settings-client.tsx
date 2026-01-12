"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Church, Clock, Pencil } from "lucide-react"
import { toast } from "sonner"
import { createMinistry, deleteMinistry, updateMinistry, createServiceTime, deleteServiceTime, updateServiceTime } from "@/actions/ministry"
import { updateMinistryLeaders } from "@/actions/ministry-update"
import { Checkbox } from "@/components/ui/checkbox"
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

export function SettingsClient({ ministries: _ministries, serviceTimes: _serviceTimes, leaders: _leaders }: SettingsClientProps) {
    const ministries = _ministries || []
    const serviceTimes = _serviceTimes || []
    const leaders = _leaders || []
    const [showMinistryModal, setShowMinistryModal] = useState(false)
    const [showServiceTimeModal, setShowServiceTimeModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Edit mode
    const [editingMinistry, setEditingMinistry] = useState<any>(null)
    const [editingServiceTime, setEditingServiceTime] = useState<any>(null)

    // Ministry form
    const [ministryName, setMinistryName] = useState("")
    const [ministryDesc, setMinistryDesc] = useState("")
    // const [ministryLeader, setMinistryLeader] = useState("") // Deprecated single leader
    const [ministryLeaders, setMinistryLeaders] = useState<string[]>([])

    // Service time form
    const [stDay, setStDay] = useState("Domingo")
    const [stTime, setStTime] = useState("09:00")
    const [stName, setStName] = useState("")

    const openMinistryModal = (ministry?: any) => {
        if (ministry) {
            setEditingMinistry(ministry)
            setMinistryName(ministry.name)
            setMinistryDesc(ministry.description || "")
            // Map existing leaders
            setMinistryLeaders(ministry.leaders?.map((l: any) => l.id) || [])
        } else {
            setEditingMinistry(null)
            setMinistryName("")
            setMinistryDesc("")
            setMinistryLeaders([])
        }
        setShowMinistryModal(true)
    }

    const openServiceTimeModal = (st?: any) => {
        if (st) {
            setEditingServiceTime(st)
            setStDay(st.day_of_week)
            setStTime(st.time?.substring(0, 5) || "09:00")
            setStName(st.name || "")
        } else {
            setEditingServiceTime(null)
            setStDay("Domingo")
            setStTime("09:00")
            setStName("")
        }
        setShowServiceTimeModal(true)
    }

    const handleSaveMinistry = async () => {
        if (!ministryName.trim()) {
            toast.error("Nome é obrigatório")
            return
        }
        setIsLoading(true)

        let ministryId = editingMinistry?.id
        let result

        if (editingMinistry) {
            result = await updateMinistry(editingMinistry.id, ministryName, ministryDesc)
        } else {
            // Check createMinistry result to get ID? createMinistry currently doesn't return ID.
            // I need to update createMinistry to return the ID.
            // For now, let's assume I can fetch it or I need to fix createMinistry first.
            // Let's modify createMinistry to return data.
            // Assume it returns { success: true, data: { id: ... } }
            result = await createMinistry(ministryName, ministryDesc)
            // If I can't get ID, I can't assign leaders immediately on creation with this separate action.
            // I'll need to modify createMinistry to handle leaders OR return ID.
            // Let's modify createMinistry next. Assuming it returns `data`.
            if (result.data) ministryId = result.data.id
        }

        if (result.error) {
            toast.error(result.error)
        } else {
            // Update Leaders
            if (ministryId) {
                await updateMinistryLeaders(ministryId, ministryLeaders)
            }
            toast.success(editingMinistry ? "Ministério atualizado!" : "Ministério criado!")
            setShowMinistryModal(false)
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

    const handleSaveServiceTime = async () => {
        setIsLoading(true)

        let result
        if (editingServiceTime) {
            result = await updateServiceTime(editingServiceTime.id, stDay, stTime, stName || undefined)
        } else {
            result = await createServiceTime(stDay, stTime, stName || undefined)
        }

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(editingServiceTime ? "Horário atualizado!" : "Horário criado!")
            setShowServiceTimeModal(false)
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
                    <Button onClick={() => openMinistryModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Ministério
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ministries.map((m) => (
                        <Card key={m.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openMinistryModal(m)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{m.name}</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground"
                                            onClick={(e) => { e.stopPropagation(); openMinistryModal(m) }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteMinistry(m.id) }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {m.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
                                )}
                                {m.leader && (
                                    <div className="flex flex-col gap-1 text-sm mt-3">
                                        <span className="text-xs font-semibold text-muted-foreground">Líderes:</span>
                                        {m.leaders && m.leaders.length > 0 ? (
                                            m.leaders.map((l: any) => (
                                                <div key={l.id} className="flex items-center gap-2">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{l.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-muted-foreground">{l.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-yellow-600">⚠️ Sem líder definido</span>
                                        )}
                                    </div>
                                )}
                                {!m.leader && (
                                    <p className="text-sm text-yellow-600">⚠️ Sem líder definido</p>
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
                    <Button onClick={() => openServiceTimeModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Horário
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceTimes.map((st) => (
                        <Card key={st.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openServiceTimeModal(st)}>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{st.day_of_week}</p>
                                        <p className="text-2xl font-bold text-primary">{st.time?.substring(0, 5)}</p>
                                        {st.name && <p className="text-sm text-muted-foreground">{st.name}</p>}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground"
                                            onClick={(e) => { e.stopPropagation(); openServiceTimeModal(st) }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteServiceTime(st.id) }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
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
                        <DialogTitle>{editingMinistry ? 'Editar Ministério' : 'Novo Ministério'}</DialogTitle>
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
                            <Label>Líderes Responsáveis</Label>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                {leaders.map((l) => (
                                    <div key={l.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`leader-${l.id}`}
                                            checked={ministryLeaders.includes(l.id)}
                                            onCheckedChange={(checked) => {
                                                setMinistryLeaders(prev =>
                                                    checked
                                                        ? [...prev, l.id]
                                                        : prev.filter(id => id !== l.id)
                                                )
                                            }}
                                        />
                                        <Label htmlFor={`leader-${l.id}`} className="cursor-pointer text-sm font-normal">
                                            {l.name}
                                        </Label>
                                    </div>
                                ))}
                                {leaders.length === 0 && <p className="text-xs text-muted-foreground">Nenhum líder cadastrado na aba Voluntários.</p>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Selecione quem gerencia este ministério.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMinistryModal(false)}>Cancelar</Button>
                        <Button onClick={handleSaveMinistry} disabled={isLoading}>
                            {isLoading ? "Salvando..." : (editingMinistry ? "Salvar" : "Criar")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Service Time Modal */}
            <Dialog open={showServiceTimeModal} onOpenChange={setShowServiceTimeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingServiceTime ? 'Editar Horário' : 'Novo Horário de Culto'}</DialogTitle>
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
                        <Button onClick={handleSaveServiceTime} disabled={isLoading}>
                            {isLoading ? "Salvando..." : (editingServiceTime ? "Salvar" : "Criar")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Tabs>
    )
}
