# VET-1 — Limpeza do template: remover autenticação e resquícios do Mirai Template

## Objetivo

Adaptar o monorepo gerado a partir do Mirai Template ao escopo real do Vetra: um CRM pessoal, executado localmente, **sem login**. A task remove o que não serve ao produto (auth em todas as camadas, variante Next, i18n, usuários demo) e deixa a documentação coerente com o projeto. Nenhuma funcionalidade nova é criada — o resultado é uma base enxuta para as próximas tasks (app shell, telas de Leads).

---

## Escopo

- Remover a autenticação de API, core, contracts, routes, database, config e web
- Esvaziar `packages/infra` (mantendo o pacote)
- Remover tabela `users`, migration atual e seed; recomeçar o histórico de migrations
- API passa a escutar somente em `127.0.0.1`, com CORS restrito à origem do web
- Transformar o layout `_authenticated` em app shell sem guard
- Remover resquícios do template (`client-next.ts`, guias Next/I18N/Auth, entradas de Next na `.dockerignore`)
- Reescrever `AGENTS.md` e `PROJECT-OVERVIEW.md` com log de decisões

---

## Visão Funcional

- Ao rodar `pnpm dev`, o navegador abre direto numa página placeholder em PT — não existe tela de login nem cadastro.
- A API sobe somente em `127.0.0.1`. Sem autenticação, isso é o que impede o acesso a partir da rede.
- O banco sobe vazio (sem tabelas de domínio e sem seed).

---

## Requisitos

- Manter a hierarquia `DomainError` → `HttpError` e o registry, removendo apenas as entradas/erros de auth
- Manter helmet, cors, error handler global e handler de 404
- Manter `errorResponseSchema` e `validationIssueSchema` em contracts
- Manter `schema/common.ts` e o client do Drizzle
- Remover dependências que ficarem sem uso e atualizar o `pnpm-lock.yaml`
- Não introduzir nenhuma entidade, endpoint ou tela nova

---

## Backend

### API (`apps/api`)
- Remover `src/features/auth` e `shared/middlewares/adminOnly.ts`
- Remover cookie-parser e os rate limiters
- Escutar em `127.0.0.1`
- CORS aceitando somente `FRONTEND_URL` (remover a origem dupla via `IP_ADDRESS`)

### Core (`packages/core`)
- Remover `features/auth` e `features/user`
- Remover erros de auth, incluindo `UnauthenticatedError` (sem uso)

### Infra (`packages/infra`)
- Remover o módulo `token` (JWT) e a dependência jsonwebtoken
- Manter o pacote com um `index` vazio, reservado para futuras capacidades técnicas (WAHA, IA)

### Contracts / Routes
- Remover schemas e rotas de auth

### Database (`packages/database`)
- Remover tabela `users`, enum `user_role`, migration `0000_*` e `seed.ts` (e o script `db:seed`)
- Recriar o volume local do Postgres

### Config
- Remover `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` e `IP_ADDRESS` de `env/server.ts`, `.env.example` e `.env`
- Remover `client-next.ts` e seu export

---

## Frontend (`apps/web`)

- Remover rotas `login.tsx` e `register.tsx`, `features/auth` e `requireAuth`
- Remover o retry de refresh após 401 em `shared/lib/axios/api.ts`
- Renomear `_authenticated` → `_app` (layout sem guard)
- Substituir a página "Welcome" por um placeholder simples em PT
- `index.html`: `<title>` Vetra, descrição real, remover canonical/og apontando para a API
- Remover `shared/utils/englishValidationMessage.ts` se ficar sem uso

---

## Documentação

- `AGENTS.md`: remover menções ao "Mirai Template", descrever `apps/web` (Vite) como única app web, remover referências a web-next e i18n
- `docs/project/PROJECT-OVERVIEW.md`: escopo do Vetra + log de decisões (sem login; API só em localhost; Postgres mantido; UI em PT sem i18n; distribuição futura sempre local; CRM como fonte da verdade do estado dos leads e pipeline de captação dono dos arquivos)
- Remover `WEB-NEXT-OVERVIEW.md`, `WEB-NEXT-DATA-LAYER.md`, `I18N.md` e `AUTH-AND-SESSIONS.md`
- Reescrever `API-MODULES`, `ADDING-A-FEATURE` e `WEB-VITE-*` usando uma feature genérica de exemplo (leads) no lugar de auth
- Limpar `.dockerignore`

---

## Notas Técnicas

- Task exclusivamente de remoção/reorganização — sem lógica nova
- Não deixar imports quebrados nem exports apontando para módulos removidos
- Testes fora do escopo (o projeto ainda não tem setup de testes)

---

## Critérios de Aceite

- `pnpm install`, `pnpm check-types`, `pnpm lint` e `pnpm build` passam sem erros
- Após `docker compose down -v && docker compose up -d`, `db:migrate` roda sem erro e sem migrations
- `pnpm dev` abre o web direto no placeholder, sem login e sem erros no console
- A API responde em `127.0.0.1:8000` e não responde pelo IP da LAN
- Uma busca por `auth`, `jwt`, `register` e `Mirai` não encontra resquícios relevantes no código nem nos docs
