# Vetra

CRM pessoal para gestão de leads e captação de clientes. Roda localmente e é usado pelo navegador.

## Requisitos

- Node.js >= 24.20
- pnpm 11
- Docker (PostgreSQL)

## Rodando localmente

```sh
cp .env.example .env
pnpm install
docker compose up -d
pnpm --filter @vetra/database db:migrate
pnpm dev
```

- Web: http://localhost:3000
- API: http://127.0.0.1:8000/api (aceita conexões apenas da própria máquina)

## Estrutura

- `apps/api` — API REST (Express 5)
- `apps/web` — interface (Vite + React)
- `packages/*` — domínio, contratos, banco, rotas e configurações compartilhadas
- `docs/` — guias de arquitetura e visão do projeto
- `tasks/` — tarefas planejadas (`VET-<n>.md`)
