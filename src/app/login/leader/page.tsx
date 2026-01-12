"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Heart, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { loginLeader } from "@/actions/auth"

export default function LeaderLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        const result = await loginLeader(formData)

        if (result.error) {
            toast.error("Erro ao entrar: " + result.error)
        } else {
            toast.success("Login realizado com sucesso!")
            // Force Hard Navigation to ensure middleware re-evaluates new cookie
            if (result.redirectTo) {
                window.location.href = result.redirectTo
            } else {
                router.push("/leader")
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="bg-primary p-3 rounded-xl mb-4 shadow-lg shadow-primary/20">
                    <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
                <p className="text-muted-foreground">Entre para acessar suas escalas</p>
            </div>

            <div className="w-full max-w-sm">
                <Tabs defaultValue="leader" className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="volunteer" className="text-base" asChild>
                            <Link href="/login/volunteer">Voluntário</Link>
                        </TabsTrigger>
                        <TabsTrigger value="leader" className="text-base" disabled>Líder / Admin</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6 pb-8 px-6 space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-2">Acesso de Líder / Admin</h2>
                            <p className="text-sm text-muted-foreground">Entre com seu e-mail e senha</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <Link href="/repair" className="text-xs text-red-500 font-bold hover:underline">
                                    Problemas de Acesso?
                                </Link>
                                <button type="button" onClick={() => toast.info("Contate o suporte para redefinir sua senha.")} className="text-xs text-primary font-medium hover:underline bg-transparent border-0 p-0 cursor-pointer">Esqueceu a senha?</button>
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
                © 2026 Servir. Todos os direitos reservados.
            </p>
        </div>
    )
}
