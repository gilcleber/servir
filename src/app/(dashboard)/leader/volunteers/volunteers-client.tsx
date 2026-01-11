"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Phone, Mail, Copy } from "lucide-react"
import { toast } from "sonner"
import { createVolunteer } from "@/actions/admin"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"

interface VolunteersClientProps {
    volunteers: any[]
    ministries: any[]
    churchId?: string
}

export function VolunteersClient({ volunteers, ministries, churchId }: VolunteersClientProps) {
    const [showModal, setShowModal] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [createdPin, setCreatedPin] = useState("")
    const [createdName, setCreatedName] = useState("")
    
    // Form
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [selectedMinistries, setSelectedMinistries] = useState<string[]>([])
    
    const filteredVolunteers = volunteers.filter(v => 
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const getMinistryNames = (ministryIds: string[] | null) => {
        if (!ministryIds || ministryIds.length === 0) return []
        return ministries
            .filter(m => ministryIds.includes(m.id))
            .map(m => m.name)
    }
    
    const handleToggleMinistry = (ministryId: string) => {
        setSelectedMinistries(prev => 
            prev.includes(ministryId) 
                ? prev.filter(id => id !== ministryId)
                : [...prev, ministryId]
        )
    }
    
    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Nome é obrigatório")
            return
        }
        if (!churchId) {
            toast.error("Erro: Igreja não identificada")
            return
        }
        
        setIsLoading(true)
        const result = await createVolunteer(name, email, selectedMinistries, churchId)
        
        if (result.error) {
            toast.error(result.error)
        } else if (result.pin) {
            setCreatedPin(result.pin)
            setCreatedName(name)
            setShowModal(false)
            setShowPinModal(true)
            // Reset form
            setName("")
            setEmail("")
            setPhone("")
            setSelectedMinistries([])
        }
        setIsLoading(false)
    }
    
    const copyPin = () => {
        navigator.clipboard.writeText(createdPin)
        toast.success("PIN copiado!")
    }
    
    return (
        <div className="space-y-6">
            {/* Search & Add */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar voluntário..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Voluntário
                </Button>
            </div>
            
            {/* Volunteers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVolunteers.map((v) => (
                    <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {v.name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{v.name}</p>
                                    
                                    {v.email && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{v.email}</span>
                                        </div>
                                    )}
                                    
                                    {v.phone && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Phone className="w-3 h-3" />
                                            <span>{v.phone}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {getMinistryNames(v.ministry_ids).map((name, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] py-0">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {filteredVolunteers.length === 0 && (
                    <p className="text-muted-foreground col-span-3 text-center py-12">
                        {searchTerm ? "Nenhum voluntário encontrado." : "Nenhum voluntário cadastrado ainda."}
                    </p>
                )}
            </div>
            
            {/* Create Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Voluntário</DialogTitle>
                        <DialogDescription>
                            Um PIN de 4 dígitos será gerado automaticamente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome Completo *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="João da Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="joao@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Ministérios</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                {ministries.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={m.id}
                                            checked={selectedMinistries.includes(m.id)}
                                            onCheckedChange={() => handleToggleMinistry(m.id)}
                                        />
                                        <label htmlFor={m.id} className="text-sm cursor-pointer">
                                            {m.name}
                                        </label>
                                    </div>
                                ))}
                                {ministries.length === 0 && (
                                    <p className="text-sm text-muted-foreground col-span-2">
                                        Cadastre ministérios primeiro.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar Voluntário"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* PIN Success Modal */}
            <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
                <DialogContent className="max-w-sm text-center">
                    <DialogHeader>
                        <DialogTitle className="text-center">Voluntário Criado!</DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            PIN de acesso para <strong>{createdName}</strong>:
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-4xl font-bold tracking-[0.5em] text-primary">
                                {createdPin}
                            </div>
                            <Button variant="ghost" size="icon" onClick={copyPin}>
                                <Copy className="w-5 h-5" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Anote este PIN! Ele será usado para o voluntário acessar o sistema.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button className="w-full" onClick={() => setShowPinModal(false)}>
                            Entendi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
