# Contribuindo com o Vetra

Antes de qualquer coisa: o Vetra usa a licença PolyForm Shield (veja o `LICENSE`). O código é aberto para ler e
modificar, mas não para revender nem para competir com ele.

## Para quem desenvolve

Requisitos: Node.js >= 24.20, pnpm 11 e Docker.

```sh
cp .env.example .env
pnpm install
pnpm docker:dev
pnpm --filter @vetra/database db:migrate
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000/api (aceita conexões apenas da própria máquina)

Antes de subir o Docker, troque `WAHA_API_KEY` no `.env` por um valor longo e aleatório. Em uma
instalação que já existia, adicione `WAHA_URL` e `WAHA_API_KEY` ao `.env`: sem elas, o Docker e a
API não sobem, mas os comandos do banco continuam funcionando sem elas. Se trocar a chave depois,
recrie o serviço com `pnpm docker:dev`.

`pnpm docker:dev` sobe só o banco e o WhatsApp, para o desenvolvimento, pelo `compose.dev.yaml`, num projeto
próprio (`vetra-dev`) com containers e volumes só dele: nada é compartilhado com o Vetra compilado. Ele publica as
portas `127.0.0.1:5432` e `127.0.0.1:3001` para o `pnpm dev` e para ferramentas de banco. Se alguma delas já
estiver ocupada, troque `VETRA_DB_PORT` ou `VETRA_WAHA_PORT` no `.env` (e a `DATABASE_URL` ou a `WAHA_URL`
junto). Para parar: `pnpm docker:dev:down`. O WhatsApp do desenvolvimento precisa de uma sessão própria: ligar o
mesmo número aqui e no Vetra compilado derruba um dos dois, então prefira um número de teste.

O Vetra compilado (a API com o web dentro, a imagem do `Dockerfile`) está no perfil `app`, e o
`iniciar-vetra-*` o sobe só com o `compose.yaml`: `docker compose -f compose.yaml --profile app up -d --build` (com o `Dockerfile` ao lado, o launcher constrói a imagem; sem ele,
baixa a imagem pronta).
Assim, quem só usa o Vetra não tem nenhuma porta aberta além da do app (4720), e o banco e o WhatsApp
não conflitam com mais nada no computador.

`pnpm db:seed` enche o banco com dados de demonstração e **apaga todos os leads**. Num banco que já
tem leads ele recusa, a não ser que você passe `--yes`.

## Estrutura

- `apps/api` — API REST (Express 5), que em produção também serve o web compilado
- `apps/web` — interface (Vite + React)
- `packages/*` — domínio, contratos, banco, rotas e configurações compartilhadas
- `docs/` — guias de arquitetura e visão do projeto
- `tasks/` — tarefas planejadas (`VET-<n>.md`)
- `Dockerfile`, `compose.yaml` e `scripts/` (`iniciar-vetra-windows`, `iniciar-vetra-mac-linux`, `parar-vetra-*`) — rodar o Vetra compilado, no Docker; `compose.dev.yaml` — o banco e o WhatsApp só do desenvolvimento (`pnpm docker:dev`)
