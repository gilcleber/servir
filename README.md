# Servir - Gestão de Voluntários (SaaS MVP)

Plataforma SaaS multi-tenant para gestão de escalas de voluntários em igrejas. Automatiza a organização, confirmação e substituição de voluntários.

## Tecnologias

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components:** Shadcn/ui, Lucide React
- **Backend/Database:** Supabase (PostgreSQL + Auth + RLS)
- **State Management:** Zustand
- **AI:** Lógica de Sugestão Inteligente de Substitutos

## Configuração do Projeto

### 1. Pré-requisitos

- Node.js 18+ instalado.
- Conta no [Supabase](https://supabase.com/).

### 2. Configuração do Banco de Dados (Supabase)

1. Crie um novo projeto no Supabase.
2. Vá para o **SQL Editor** no painel do Supabase.
3. Copie o conteúdo do arquivo `supabase/schema.sql` deste projeto.
4. Execute o script SQL para criar as tabelas e políticas de segurança (RLS).

### 3. Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha as variáveis com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-projeto
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

### 4. Executando Localmente

Instale as dependências e inicie o servidor:

```bash
cd serving-app
npm install
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

## Funcionalidades (MVP)

*   **Landing Page:** Apresentação do produto.
*   **Login:**
    *   **Voluntário:** Acesso via PIN de 4 dígitos.
    *   **Líder:** Acesso via E-mail e Senha.
*   **Dashboard do Voluntário:** Visualização de escalas, confirmação/recusa, calendário de disponibilidade.
*   **Dashboard do Líder:** Estatísticas, gestão de escalas, substituição inteligente (IA).

## Design System

O projeto segue um guia visual "Mobile-First" com tema Teal/Blue e tipografia moderna, utilizando componentes Shadcn/ui customizados.

## Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com). Basta importar o repositório e configurar as variáveis de ambiente.
