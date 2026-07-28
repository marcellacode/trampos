# Jobera

Copiloto de carreira com IA: compatibilidade de vagas, candidatura assistida, discovery inteligente, simulador de entrevistas e currículo adaptado por vaga.

Stack: **Next.js 16** · **Supabase** · **TanStack Query** · **Groq** (LLM) · **Adzuna** (vagas externas)

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
| `ADZUNA_APP_ID` | Recomendada | Vagas externas via [Adzuna API](https://developer.adzuna.com/) |
| `ADZUNA_APP_KEY` | Recomendada | Par do App ID |
| `ADZUNA_COUNTRY` | Não | Default: `br` |
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
| **Matching** | Score de compatibilidade % (heurística + refinamento Groq) |
| **Candidatura assistida** | IA prepara currículo + carta; você conclui no site da empresa |
| **Vagas externas (Adzuna)** | Busca, detalhe, apply/hide/save unificados com vagas internas |
| **Discovery** | Hide/save persistidos, filtros inteligentes (NL → chips), summary recalculado |
| **Onboarding** | PDF → Storage, import GitHub, colar texto LinkedIn (sem API paga) |
| **Entrevistas** | Simulador com feedback por turno e score final |
| **Jobe Chat** | Assistente IA + bulk prepare de candidaturas |
| **Currículo** | Versões adaptadas por vaga visíveis e regeneráveis |

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

### 3. Vaga Adzuna (requer `ADZUNA_*`)

1. Configure `ADZUNA_APP_ID` e `ADZUNA_APP_KEY`.
2. **Vagas:** busque — vagas externas aparecem misturadas ao catálogo.
3. Abra vaga Adzuna (`adzuna-*` na URL) → apply abre URL externa.
4. Confirme conclusão no sidebar após candidatar no site da empresa.
5. Teste hide/save em vaga externa.

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
