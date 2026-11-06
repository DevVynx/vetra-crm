# Vetra

CRM pessoal para gestão de leads e captação de clientes. Roda no seu computador e é usado pelo navegador.

## Instalação (para usar o Vetra)

Você só precisa do **Docker Desktop** (https://www.docker.com/products/docker-desktop). Não precisa
instalar Node nem usar o terminal.

1. Instale e abra o Docker Desktop. Espere ele terminar de iniciar.
2. Baixe o **`vetra-instalador.zip`** na página de Releases do Vetra
   (https://github.com/DevVynx/vetra-crm/releases/latest) e extraia a pasta. Ele tem só o necessário, sem o código-fonte.
3. Abra a pasta **`scripts`** e dê um duplo clique em **`iniciar-vetra-windows.bat`** (no macOS e no Linux, rode `bash scripts/iniciar-vetra-mac-linux.sh`). O arquivo `win-auxiliar.ps1` da mesma pasta é só um auxiliar do `.bat`: não precisa abri-lo.

Na primeira vez ele demora alguns minutos, porque baixa tudo. Quando terminar, o navegador abre em
**http://localhost:4720**. Nas próximas vezes é rápido.

Para usar uma versão específica em vez da mais recente, tire o `#` da linha `VETRA_VERSION` no arquivo `.env`
e escreva o número (por exemplo, `0.1.0`).

**Mac com chip Apple (M1 ou mais novo) e Linux ARM:** o Vetra publica a imagem para esses computadores, mas ainda
**não foi testado** neles. Pode funcionar, pode não funcionar.

- **Para parar:** `scripts/parar-vetra-windows.bat` (ou `bash scripts/parar-vetra-mac-linux.sh`). Seus dados ficam guardados. Depois de parar, o Vetra só volta quando você iniciar de novo, mesmo que o computador seja reiniciado.
- **Para o Vetra voltar sozinho quando o computador ligar:** no Docker Desktop, abra **Settings →
  General** e marque **Start Docker Desktop when you sign in to your computer**. Depois disso, ao ligar o
  computador e entrar, o Vetra já está no ar.
- **A porta é a 4720**, escolhida por ser incomum. Se outro programa a usar, troque o número nas linhas
  com `4720` do `compose.yaml` e dos scripts da pasta `scripts`.

O Vetra só aceita conexões do próprio computador. Não existe login, porque ninguém mais consegue
abri-lo.

## Atualizando o Vetra

Em **Configurações → Atualizações** o Vetra mostra a versão instalada e avisa quando existe uma nova
(o botão **Verificar agora** consulta de novo). Para atualizar:

1. Abra a pasta **`scripts`** e dê duplo clique em **`atualizar-vetra-windows.bat`** (no macOS e no Linux, rode
   `bash scripts/atualizar-vetra-mac-linux.sh`). O Vetra precisa estar aberto, porque é ele que diz qual é a versão mais nova.
2. Confirme com **s**. O Vetra fica fora do ar por alguns instantes.

O que o atualizador faz, nesta ordem: baixa a versão nova, guarda um **backup do banco** na pasta `backups` (os 5 mais
recentes ficam), troca o Vetra e espera ele responder. **Se a versão nova não iniciar, ele volta sozinho para a anterior**
e avisa. Seus leads e o WhatsApp conectado continuam como estavam.

Uma mudança que a versão nova já tenha feito no banco não é desfeita pela volta; é para esse caso que existe o backup.

### Voltando a um backup

Para trazer os dados de um backup (os arquivos `backups/vetra-AAAAMMDD-HHMMSS-vX.Y.Z.sql.gz`), com o Vetra parado
(`scripts/parar-vetra-*`), rode no terminal, dentro da pasta do Vetra, trocando `ARQUIVO` pelo nome do backup:

```sh
docker compose -f compose.yaml up -d --wait db
docker compose -f compose.yaml cp backups/ARQUIVO db:/tmp/restaurar.sql.gz
docker compose -f compose.yaml exec -T db psql -U dev -d postgres -c "DROP DATABASE vetra" -c "CREATE DATABASE vetra"
docker compose -f compose.yaml exec -T db sh -c "gunzip -c /tmp/restaurar.sql.gz | psql -U dev -d vetra -q"
```

Depois, no arquivo `.env`, coloque em `VETRA_VERSION` a versão do nome do backup e abra o Vetra de novo
(`iniciar-vetra`). O backup guarda os dados do CRM e as conversas importadas do WhatsApp; a conexão do WhatsApp em si
(o QR Code) fica em outro volume e não muda.

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

## Licença

O código está aberto para ler, mas o Vetra **não é software livre**: ele usa a licença
[PolyForm Shield 1.0.0](LICENSE). Em resumo:

- **Pode:** usar o Vetra, inclusive no seu negócio, estudar o código e modificá-lo para o seu uso.
- **Não pode:** usar o código para oferecer um produto ou serviço que concorra com o Vetra (por exemplo, vendê-lo ou hospedá-lo para terceiros).

O texto da licença no arquivo `LICENSE` é o que vale. Para qualquer uso fora disso, fale com o autor.
Quer mexer no código? Veja o [CONTRIBUTING.md](https://github.com/DevVynx/vetra-crm/blob/main/CONTRIBUTING.md).
