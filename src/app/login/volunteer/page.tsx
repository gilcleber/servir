"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PinInput } from "@/components/domain/pin-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { loginVolunteer } from "@/actions/auth"

export default function VolunteerLoginPage() {
    const [pin, setPin] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        if (pin.length !== 4) return
        setIsLoading(true)

        // Call Server Action
        const result = await loginVolunteer(pin)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Bem-vindo!")
            router.push("/volunteer")
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
                <Tabs defaultValue="volunteer" className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="volunteer" className="text-base" disabled>Voluntário</TabsTrigger>
                        <TabsTrigger value="leader" className="text-base" asChild>
                            <Link href="/login/leader">Líder / Admin</Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6 pb-8 px-6 text-center space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Acesso do Voluntário</h2>
                            <p className="text-sm text-muted-foreground">Digite seu PIN de 4 dígitos para entrar</p>
                        </div>

                        <PinInput value={pin} onChange={setPin} disabled={isLoading} />

                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleLogin}
                            disabled={pin.length !== 4 || isLoading}
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>

                        <p className="text-sm text-muted-foreground">
                            Não tem um PIN? <a href="#" className="text-primary font-medium hover:underline">Fale com seu líder</a>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
                © 2026 Servir. Todos os direitos reservados.
            </p>
        </div>
    )
}
