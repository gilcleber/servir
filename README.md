# Servir - Guia de Resgate e Configuração (MVP)

Este guia cobre a configuração completa para garantir que o Backend (Supabase) e o Frontend (Next.js) funcionem em sincronia.

## 1. Configuração do Backend (Supabase)

### Passo A: Criar Tabelas
1. Acesse seu projeto no Supabase.
2. Vá em **SQL Editor**.
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`.
4. Clique em **Run**.

### Passo B: Gerar Dados de Teste (Seed)
1. Ainda no SQL Editor, limpe a janela e cole o conteúdo de `supabase/seed.sql`.
2. Clique em **Run**.
3. Isso criará: Uma Igreja, um Ministério, um Horário de Culto e uma Escala futura.

### Passo C: Criar Usuário de Teste (Manual)
Como o sistema usa segurança RLS, você precisa de um usuário real:
1. Vá em **Authentication** > **Users** > **Add User**.
2. Crie um usuário (Ex: `lider@servir.app`) com uma senha conhecida.
3. Copie o **User UID** gerado.
4. Vá em **Table Editor** > tabela **profiles**.
5. Clique em **Insert New Row** e preencha:
   - `id`: Cole o UID do usuário.
   - `church_id`: Copie o ID da igreja criada no Passo B (tabela `churches`).
   - `role`: digite `leader` (ou `volunteer`).
   - `name`: Seu Nome.
   - `email`: Mesmo email usado no passo 2.
6. Salve.

## 2. Configuração Local

### Variáveis de Ambiente
Certifique-se de que seu arquivo `.env.local` tenha as 4 chaves obrigatórias:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_AI_API_KEY=...
```

### Rodar o Projeto
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`. Tente logar com o usuário criado.

## 3. Deploy (Vercel)

O projeto já está configurado para a Vercel.
1. Certifique-se de adicionar as **mesmas variáveis de ambiente** no painel da Vercel (Project Settings > Environment Variables).
2. O arquivo `next.config.ts` foi ajustado para gerar a pasta `dist`, corrigindo o erro anterior.

## Funcionalidades Chave

- **Login Voluntário**: O Login por PIN requer que o perfil tenha um PIN Hash e que o usuário Auth exista. Para testes rápidos, use o Login de Líder (Email/Senha).
- **IA**: O botão "Substituir (IA)" no Dashboard do Líder consultará a API do Google Gemini.
- **Responsividade**: O layout foi ajustado para Mobile-First (testado em larguras pequenas).
