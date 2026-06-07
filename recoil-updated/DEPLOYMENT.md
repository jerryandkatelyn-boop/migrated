# RECOIL AI — Deployment Guide

## Stack
- **Frontend / API:** Next.js 15 (App Router) → Vercel
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (email/password)
- **AI:** OpenRouter (primary) + OpenAI / Anthropic / Google / DeepSeek
- **Vector Search:** Supabase pgvector (RAG)

---

## 1. Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a region close to your users
3. Save your **database password** securely

### 1.2 Run Migrations
Go to **SQL Editor** in Supabase Dashboard and run each migration in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_vector_search.sql
supabase/migrations/003_rls_policies.sql
```

> ⚠️ Run **002** only after enabling the `vector` extension:
> Dashboard → Database → Extensions → Search "vector" → Enable

### 1.3 Enable pgvector
Dashboard → **Database** → **Extensions** → search `vector` → Toggle ON

### 1.4 Configure Auth
Dashboard → **Authentication** → **Settings**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** Add `https://your-app.vercel.app/api/auth/callback`
- **Email confirmations:** Enable (recommended)
- **Password minimum length:** 8

### 1.5 Get API Keys
Dashboard → **Project Settings** → **API**:

- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(never expose to browser)*

### 1.6 Set First Admin
After deploying and signing up with your admin email, run in SQL Editor:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

---

## 2. AI Provider Setup

### OpenRouter (Primary — Required)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create API key → copy to `OPENROUTER_API_KEY`
3. OpenRouter routes to GPT-4o, Claude, Gemini, etc. — single key covers all

### Optional Direct Keys
| Provider | Dashboard | Env Var |
|----------|-----------|---------|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Anthropic | [console.anthropic.com](https://console.anthropic.com/settings/keys) | `ANTHROPIC_API_KEY` |
| Google AI | [aistudio.google.com](https://aistudio.google.com/apikey) | `GOOGLE_API_KEY` |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/api_keys) | `DEEPSEEK_API_KEY` |

---

## 3. Vercel Deployment

### 3.1 Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

Or: push to GitHub and connect to Vercel via the dashboard.

### 3.2 Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**, add all variables from `.env.example`:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | From Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Never expose to browser** |
| `OPENROUTER_API_KEY` | ✅ | Primary AI provider |
| `APP_SECRET` | ✅ | Random 32+ char string |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your Vercel domain |
| `OPENAI_API_KEY` | ⚪ | Optional fallback |
| `ANTHROPIC_API_KEY` | ⚪ | Optional fallback |
| `GOOGLE_API_KEY` | ⚪ | Optional fallback |
| `DEEPSEEK_API_KEY` | ⚪ | Optional fallback |
| `ADMIN_EMAIL` | ⚪ | Auto-promotes this email to admin |

### 3.3 Supabase Auth Redirect
After getting your Vercel URL, update Supabase:
- Dashboard → Auth → Settings → **Site URL** → set to `https://your-app.vercel.app`
- **Redirect URLs** → add `https://your-app.vercel.app/api/auth/callback`

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in all values in .env.local

# Start development server
npm run dev
# → http://localhost:3000
```

### Local Supabase (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (Docker required)
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types
npm run db:types
```

---

## 5. RAG / Vector Search Setup

### Enable pgvector
Already done in migration `002_vector_search.sql`.

### Ingest Knowledge Base Documents
Use the server-side service:

```typescript
import { ingestDocument, ingestDocumentsBatch } from '@/server/services/vector-search';

// Single document
await ingestDocument({
  title: 'DataStore Best Practices',
  content: 'Always use pcall()...',
  source: 'https://developer.roblox.com',
  category: 'roblox-api',
});

// Batch
await ingestDocumentsBatch(documents);
```

Requires `OPENAI_API_KEY` or `OPENROUTER_API_KEY` for embedding generation.

---

## 6. Security Audit Notes

### Fixed Issues (from original codebase)
| Issue | Status |
|-------|--------|
| Kimi OAuth credentials in code | ✅ Removed — replaced with Supabase Auth |
| MySQL credentials in env | ✅ Removed — no DB credentials needed (Supabase anon key only) |
| Hardcoded OWNER_UNION_ID | ✅ Removed |
| Session cookie forgery risk (manual JWT) | ✅ Fixed — Supabase manages sessions |
| No route authorization checks | ✅ Fixed — middleware + tRPC procedures |
| SQL injection risk (raw queries) | ✅ Fixed — Supabase client uses parameterized queries |
| Admin endpoints without auth check | ✅ Fixed — `adminProcedure` enforces role |
| Missing RLS | ✅ Fixed — comprehensive RLS policies applied |
| Service role exposed | ✅ Fixed — only used server-side |

### Ongoing Security Best Practices
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_PASSWORD` to the client
- Use `NEXT_PUBLIC_` prefix only for variables safe to expose
- Monitor Supabase Auth logs for suspicious activity
- Enable Supabase [leaked password protection](https://supabase.com/docs/guides/auth/password#leaked-password-protection)
- Review RLS policies before adding new tables
- All AI streaming is authenticated — no anonymous chat access

---

## 7. Post-Deployment Checklist

- [ ] Run all 3 SQL migrations
- [ ] Enable pgvector extension in Supabase
- [ ] Set environment variables in Vercel
- [ ] Update Supabase Auth redirect URLs
- [ ] Sign up with admin email
- [ ] Run `UPDATE users SET role='admin' WHERE email='...'`
- [ ] Verify login flow works
- [ ] Test a chat message
- [ ] Verify admin panel is accessible
- [ ] Set `ADMIN_EMAIL` env var for automatic promotion on future deploys
- [ ] (Optional) Ingest knowledge base documents for RAG

---

## 8. Files Deleted (from original project)

The following files from the original Vite/Hono/MySQL/Kimi stack were **removed**:

```
drizzle.config.ts
db/schema.ts
db/relations.ts
db/seed.ts
db/migrations/
api/kimi/auth.ts        ← Kimi OAuth removed
api/kimi/platform.ts    ← Kimi platform API removed
api/kimi/session.ts     ← Kimi session handling removed
api/kimi/types.ts       ← Kimi types removed
api/queries/connection.ts  ← Drizzle/MySQL connection removed
api/lib/vite.ts
api/boot.ts             ← Hono server entrypoint removed
vite.config.ts          ← Vite config removed
index.html              ← Vite SPA entry removed
tsconfig.app.json
tsconfig.node.json
tsconfig.server.json
src/providers/trpc.tsx  ← Replaced by components/providers/trpc-provider.tsx
```

## 9. Architecture Overview

```
Browser
  │
  ├── Next.js App Router (Vercel)
  │   ├── app/(auth)/login          ← Supabase signInWithPassword
  │   ├── app/(auth)/signup         ← Supabase signUp
  │   ├── app/(app)/                ← Protected: requires auth session
  │   │   ├── page.tsx              ← Chat dashboard
  │   │   └── admin/page.tsx        ← Admin panel (role=admin only)
  │   └── api/
  │       ├── trpc/[trpc]/          ← tRPC handler (fetchRequestHandler)
  │       ├── stream/chat/          ← AI streaming endpoint (streamText)
  │       └── auth/callback/        ← Supabase OAuth code exchange
  │
  ├── Supabase (Hosted PostgreSQL)
  │   ├── auth.users                ← Managed by Supabase Auth
  │   ├── public.users              ← Extended profiles + roles
  │   ├── public.chats              ← Chat sessions
  │   ├── public.messages           ← Message history
  │   ├── public.usage_tracking     ← Daily usage per user
  │   ├── public.documents          ← RAG knowledge base
  │   └── public.*                  ← Feature flags, prompts, etc.
  │
  └── AI Providers (via OpenRouter)
      ├── OpenAI GPT-4o / GPT-4o-mini
      ├── Anthropic Claude Sonnet/Opus
      ├── Google Gemini 2.5
      └── DeepSeek Chat/R1
```
