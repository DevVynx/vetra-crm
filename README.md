# Vetra

CRM pessoal para gestão de leads e captação de clientes. Roda no seu computador e é usado pelo navegador.

## Instalação (para usar o Vetra)

Você só precisa do **Docker Desktop** (https://www.docker.com/products/docker-desktop). Não precisa
instalar Node nem usar o terminal.

1. Instale e abra o Docker Desktop. Espere ele terminar de iniciar.
2. Baixe o Vetra (no GitHub, **Code → Download ZIP**) e extraia a pasta.
3. Abra a pasta **`scripts`** e dê um duplo clique em **`iniciar-vetra-windows.bat`** (no macOS e no Linux, rode `bash scripts/iniciar-vetra-mac-linux.sh`). O arquivo `win-auxiliar.ps1` da mesma pasta é só um auxiliar do `.bat`: não precisa abri-lo.

Na primeira vez ele demora alguns minutos, porque monta tudo. Quando terminar, o navegador abre em
**http://localhost:4720**. Nas próximas vezes é rápido.

- **Para parar:** `scripts/parar-vetra-windows.bat` (ou `bash scripts/parar-vetra-mac-linux.sh`). Seus dados ficam guardados. Depois de parar, o Vetra só volta quando você iniciar de novo, mesmo que o computador seja reiniciado.
- **Para o Vetra voltar sozinho quando o computador ligar:** no Docker Desktop, abra **Settings →
  General** e marque **Start Docker Desktop when you sign in to your computer**. Depois disso, ao ligar o
  computador e entrar, o Vetra já está no ar.
- **A porta é a 4720**, escolhida por ser incomum. Se outro programa a usar, troque o número nas linhas
  com `4720` do `compose.yaml` e dos scripts da pasta `scripts`.

O Vetra só aceita conexões do próprio computador. Não existe login, porque ninguém mais consegue
abri-lo.

## Conectando o WhatsApp

Com o app aberto, vá em **WhatsApp** e leia o QR Code com o celular. A conexão não é oficial,
então existe algum risco de bloqueio do número, e a própria tela avisa. O WhatsApp usa cerca de
400 a 750 MB de memória. As conversas importadas ficam no seu banco, e desconectar não as apaga.
Contas WhatsApp Business ainda não foram testadas.

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

Os dados ficam no PostgreSQL, em um volume do Docker, que continua existindo quando você para ou
atualiza o Vetra. A única coisa que o Vetra guarda como arquivo é a foto de perfil, em outro volume
(`vetra_data`).

## Para quem desenvolve

Requisitos: Node.js >= 24.20, pnpm 11 e Docker.

```sh
cp .env.example .env
pnpm install
docker compose up -d
pnpm --filter @vetra/database db:migrate
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000/api (aceita conexões apenas da própria máquina)

Antes de subir o Docker, troque `WAHA_API_KEY` no `.env` por um valor longo e aleatório. Em uma
instalação que já existia, adicione `WAHA_URL` e `WAHA_API_KEY` ao `.env`: sem elas, o Docker e a
API não sobem, mas os comandos do banco continuam funcionando sem elas. Se trocar a chave depois,
recrie o serviço com `docker compose up -d waha`.

`docker compose up -d` sobe só o banco e o WhatsApp, para o desenvolvimento, e o `compose.override.yaml`
(que o Docker lê sozinho) publica as portas `127.0.0.1:5432` e `127.0.0.1:3001` para o `pnpm dev` e para
ferramentas de banco. Se alguma delas já estiver ocupada, troque `VETRA_DB_PORT` ou `VETRA_WAHA_PORT` no
`.env` (e a `DATABASE_URL` ou a `WAHA_URL` junto).

O Vetra compilado (a API com o web dentro, a imagem do `Dockerfile`) está no perfil `app`, e o
`iniciar-vetra-*` o sobe só com o `compose.yaml`: `docker compose -f compose.yaml --profile app up -d --build`.
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
- `Dockerfile`, `compose.yaml` e `scripts/` (`iniciar-vetra-windows`, `iniciar-vetra-mac-linux`, `parar-vetra-*`) — rodar o Vetra compilado, no Docker; `compose.override.yaml` — as portas só do desenvolvimento
