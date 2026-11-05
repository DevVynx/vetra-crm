# Vetra

CRM pessoal para gestão de leads e captação de clientes. Roda localmente e é usado pelo navegador.

## Requisitos

- Node.js >= 24.20
- pnpm 11
- Docker (PostgreSQL e WAHA, o serviço do WhatsApp)

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

Antes de subir o Docker, troque `WAHA_API_KEY` no `.env` por um valor longo e aleatório. Em uma
instalação que já existia, adicione `WAHA_URL` e `WAHA_API_KEY` ao `.env`: sem elas, o Docker e a
API não sobem, mas os comandos do banco continuam funcionando sem elas. Se trocar a chave depois,
recrie o serviço com `docker compose up -d waha`.

## Estrutura

- `apps/api` — API REST (Express 5)
- `apps/web` — interface (Vite + React)
- `packages/*` — domínio, contratos, banco, rotas e configurações compartilhadas
- `docs/` — guias de arquitetura e visão do projeto
- `tasks/` — tarefas planejadas (`VET-<n>.md`)
