'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { forceRepairLogin } from '@/actions/repair'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function RepairPage() {
    const [email, setEmail] = useState('gilcleberlocutor@gmail.com')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRepair = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        const res = await forceRepairLogin(formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("CONTA REPARADA COM SUCESSO!")
            toast.message("Redirecionando para o painel...")
            setTimeout(() => {
                window.location.href = '/leader'
            }, 1000)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <Card className="max-w-md w-full border-red-200 shadow-xl">
                <CardHeader className="bg-red-100 rounded-t-xl">
                    <CardTitle className="text-red-900">🛠️ Reparo de Emergência</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Use esta ferramenta se você não consegue entrar de jeito nenhum.
                        Ela vai forçar a criação do seu perfil de Líder.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Seu E-mail</label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Sua Senha</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Digite sua senha..."
                        />
                    </div>

                    <Button
                        onClick={handleRepair}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12"
                        disabled={loading}
                    >
                        {loading ? "Reparando..." : "FORÇAR REPARO AGORA"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
