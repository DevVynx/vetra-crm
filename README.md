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

## Conectando o WhatsApp

Com o app aberto, vá em **WhatsApp** e leia o QR Code com o celular. A conexão não é oficial,
então existe algum risco de bloqueio do número, e a própria tela avisa. O WAHA usa cerca de
400 a 750 MB de memória. As conversas importadas ficam no seu PostgreSQL, e desconectar não as
apaga. Contas WhatsApp Business ainda não foram testadas.

## Primeiro acesso

Na primeira vez, o Vetra abre uma introdução curta: seu nome (com uma foto opcional) e o seu fuso
horário, que já vem com o do navegador. Quem já usava o Vetra não vê a introdução. Para rever, vá em
**Configurações → Introdução**.

## Exportar e importar dados

Em **Configurações → Dados**:

- **Exportar** baixa um `.zip` com planilhas CSV de leads e clientes, projetos, parcelas, despesas,
  notas, atividades pendentes e concluídas, e etapas. O WhatsApp e a foto de perfil não entram.
- **Importar** aceita esse `.zip` ou um `leads.csv` com as mesmas colunas. Antes de gravar, mostra o
  que vai acontecer: leads que já existem (pelo telefone) são pulados, e as linhas com erro são
  listadas com o arquivo, a linha e a coluna. O que for gravado entra de uma vez só, ou nada entra.

A exportação serve de cópia das suas informações do CRM. Para uma cópia completa do banco, inclusive
as conversas do WhatsApp, use `docker exec vetra_postgres pg_dump -U dev vetra > backup.sql`.

## Onde ficam os arquivos

Os dados ficam no PostgreSQL (o volume do Docker). A única coisa que o Vetra guarda como arquivo é a
foto de perfil, em `apps/api/storage/` (ou na pasta de `STORAGE_DIR`), fora do git.

## Estrutura

- `apps/api` — API REST (Express 5)
- `apps/web` — interface (Vite + React)
- `packages/*` — domínio, contratos, banco, rotas e configurações compartilhadas
- `docs/` — guias de arquitetura e visão do projeto
- `tasks/` — tarefas planejadas (`VET-<n>.md`)
