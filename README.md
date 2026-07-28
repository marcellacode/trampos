# Jobera

Copiloto de carreira com IA: compatibilidade de vagas, candidatura assistida, discovery inteligente, simulador de entrevistas e currículo adaptado por vaga.

Stack: **Next.js 16** · **Supabase** · **TanStack Query** · **Groq** (LLM) · **Adzuna, Remotive, Arbeitnow, RemoteOK, Jobicy** (vagas externas)

## Setup

```bash
npm install
cp .env.example .env.local   # preencha as variáveis abaixo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie URL e anon key para `.env.local`.
3. Aplique as migrations em `supabase/migrations/` (ordem cronológica no nome do arquivo).
4. (Opcional) Gere types: `npm run supabase:types`.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon (pública, client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim* | Chave service role — **somente servidor**, nunca `NEXT_PUBLIC_` |
| `GROQ_API_KEY` | Recomendada | IA: matching, currículo, chat, entrevistas, filtros |
| `GROQ_MODEL` | Não | Default: `llama-3.3-70b-versatile` |
| `ADZUNA_APP_ID` | Recomendada | Vagas BR via [Adzuna API](https://developer.adzuna.com/) |
| `ADZUNA_APP_KEY` | Recomendada | Par do App ID |
| `ADZUNA_COUNTRY` | Não | Default: `br` |

**Fontes gratuitas sem configuração:** Remotive, Arbeitnow, RemoteOK e Jobicy — APIs públicas, mescladas automaticamente no discovery.
| `GITHUB_TOKEN` | Não | Aumenta rate limit da GitHub API no import de perfil |
| `SUPABASE_STORAGE_BUCKET` | Não | Default: `resumes` (bucket criado na migration) |

\* Necessária para operações server-side que bypassam RLS.

**Nunca commite `.env` ou `.env.local`.** Secrets ficam apenas no servidor.

### Conta demo

Após rodar a seed migration:

- **E-mail:** `demo@jobera.app`
- **Senha:** `demo123456`

A conta demo vem com catálogo interno, candidaturas e matches pré-populados.

## Funcionalidades

| Área | O que faz |
|------|-----------|
| **Rede social profissional** | Feed, seguir perfis/empresas, perfis públicos, posts e engajamento |
| **Recrutamento** | Vagas internas na plataforma, pipeline de candidatos, mensagens recrutador ↔ candidato |
| **Matching** | Score de compatibilidade % (heurística + refinamento Groq) |
| **Candidatura assistida** | Apply interno na Jobera ou preparação + redirect para vagas externas |
| **Vagas externas** | Adzuna, Remotive, RemoteOK, Jobicy — badges e confirmação pós-redirect |
| **Discovery** | Filtro "Só candidatura na plataforma", hide/save, filtros inteligentes |
| **Onboarding** | PDF → Storage, import GitHub, colar LinkedIn |
| **Entrevistas** | Simulador com feedback por turno |
| **Jobe Chat** | Assistente IA + bulk prepare (interno vs externo) |
| **Privacidade (LGPD)** | Perfil público opt-in, exportação JSON, denunciar/bloquear no feed |

> **Home do dashboard:** `/dashboard` redireciona para `/dashboard/feed` após login/onboarding.

## Degradação graceful (sem `GROQ_API_KEY`)

| Feature | Comportamento sem IA |
|---------|---------------------|
| Matching | Heurística 0–100% funciona normalmente |
| Candidatura | Currículo base + carta genérica |
| Entrevista | Pergunta padrão, feedback genérico, score ~70 |
| Smart filters | Query vira label + busca literal |
| Jobe Chat | Erro com aviso para configurar a key |
| PDF parse / colar LinkedIn | Falha com mensagem clara |

## Como testar manualmente

### 1. Conta demo

1. Login com `demo@jobera.app` / `demo123456`.
2. **Dashboard → Vagas:** veja compatibilidade % nos cards.
3. Abra uma vaga → **Preparar candidatura com IA** → confira currículo/carta.
4. **Mensagens / Assistente:** converse com Jobe; teste bulk prepare.
5. **Currículo:** veja versões adaptadas por vaga.

### 2. Conta nova (não-demo)

1. Cadastre-se com e-mail/senha.
2. **Onboarding:** teste upload PDF, import `@username` GitHub ou colar texto.
3. Ao concluir, matches são calculados em background.
4. **Discovery:** salve/oculte vagas → recarregue → persistência confirmada.
5. Filtro inteligente: digite algo como *"vagas remotas de React sênior"*.

### 4. Rede + feed + recrutamento

1. **Feed:** abas Para você / Explorar; siga alguém em `/dashboard/rede` → Descobrir.
2. **Perfil público:** Currículo → Visibilidade → ativar perfil público e toggles por seção.
3. **Auto-post:** toggle "Compartilhar conquistas" → adicione certificado ou candidate-se a vaga interna.
4. **Empresa:** `/dashboard/empresa` → publique vaga interna → candidatos em Candidatos → Enviar mensagem.
5. **Candidato:** responda em Mensagens → Pessoas; badge unread no header.
6. **Moderação:** menu ⋯ em post de outro usuário → Denunciar ou Bloquear.

### 5. Apply interno vs externo

1. Vaga **Vaga Jobera** → botão "Enviar candidatura" (sidebar interno).
2. Vaga **Externa** → "Preparar candidatura com IA" → copiar → abrir site → "Já concluí no site".
3. Discovery → chip **Só candidatura na plataforma** filtra apply interno.
4. Busca universal (Ctrl+K): digite nome de vaga, perfil ou empresa.

### 6. Privacidade

1. Configurações → Exportar meus dados (JSON).
2. Perfil público só exibe seções habilitadas nos toggles de visibilidade.

## Scripts

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run start        # servir build
npm run lint         # ESLint
npm run supabase:types  # regenerar database.types.ts
```

## Roadmap (APIs pagas)

Com budget futuro, candidatos naturais de evolução:

- **Submit ATS real** — Greenhouse/Lever/Ashby API para envio automático (hoje: prepara + abre URL).
- **LinkedIn API** — import OAuth de perfil (hoje: colar texto exportado).
- **Rate limiting distribuído** — Redis/Upstash (hoje: in-memory, reseta no restart).
- **Enrichment pago** — Clearbit, People Data Labs para dados de empresa/contato.

## Licença

Privado — Jobera © 2026.
