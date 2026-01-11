import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Users, Calendar, ShieldCheck, Smartphone, Bell, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl text-primary-foreground tracking-tight" style={{ color: 'var(--foreground)' }}>Servir</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login/volunteer">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/login/leader">
            <Button>Começar Agora</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
        <div className="space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
            Gestão Inteligente de Escalas
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Organize sua equipe de <span className="text-primary">voluntários</span> com facilidade
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Substitua grupos de WhatsApp por uma plataforma moderna. <br className="hidden lg:block" />
            Crie escalas, confirme presenças e encontre substitutos em minutos, não horas.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/login/leader">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-blue-900/10">
                Começar Gratuitamente
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white">
              Ver Demonstração
            </Button>
          </div>

          <div className="pt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-blue-${i * 100 + 100}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-gray-900">500+ voluntários</strong> já usam
            </p>
          </div>
        </div>

        {/* Hero Image / Mockup */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-full blur-3xl opacity-50 -z-10" />
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Mock Schedule Card 1 */}
                <div className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Louvor</p>
                    <p className="text-sm text-muted-foreground">Domingo, 12 Jan • 09:00</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Confirmado</span>
                </div>
                {/* Mock Schedule Card 2 */}
                <div className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Recepção</p>
                    <p className="text-sm text-muted-foreground">Domingo, 19 Jan • 18:00</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pendente</span>
                </div>
                <Button className="w-full mt-2" variant="outline">Ver Escala Completa</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white py-20 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo que você precisa para gerenciar escalas</h2>
            <p className="text-muted-foreground">Uma plataforma completa pensada para simplificar a vida de líderes e voluntários.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Escalas Inteligentes"
              desc="Cronogramas visualmente organizados e disponibilidade de cada membro em tempo real."
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-primary" />}
              title="Notificações Push"
              desc="Alertas via app e e-mail para lembrar os voluntários. Nenhuma falta despercebida."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Gestão de Equipe"
              desc="Gerencie cadastros, funções e histórico de cada voluntário em um único lugar."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
              title="Substituições Rápidas"
              desc="Encontre substitutos em minutos com sugestão inteligente baseada em disponibilidade."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-primary" />}
              title="Mobile-First"
              desc="Acesse de qualquer dispositivo. Interface otimizada para uso em smartphones."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              title="Seguro e Confiável"
              desc="Seus dados estão protegidos com as melhores práticas de segurança do mercado."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="10+" label="Igrejas" />
          <Stat number="500+" label="Voluntários" />
          <Stat number="2000+" label="Escalas" />
          <Stat number="95%" label="Satisfação" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar a gestão de voluntários?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Comece agora gratuitamente e veja como o Servir pode ajudar sua igreja a organizar escalas de forma muito mais eficiente.</p>
          <Link href="/login/leader">
            <Button size="lg" className="px-10 h-12 text-lg">Criar Conta Gratuita</Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-100 bg-white text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="font-bold text-gray-900">Servir</span>
        </div>
        © 2026 Servir. Feito com ❤️ para igrejas.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="mb-4 bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <h4 className="text-3xl font-bold text-primary mb-1">{number}</h4>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  )
}
