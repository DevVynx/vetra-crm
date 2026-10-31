# VET-4 — Leads e Clientes: listas e páginas de detalhe (primeira versão) com dados mockados

## Objetivo

Construir as duas abas do CRM, **Leads** e **Clientes**, cada uma com sua **lista** e sua **página de detalhe**. Um cliente é um lead que fechou: os dois leem o mesmo registro, mas são telas com focos diferentes.

- **Leads:** muito volume (10 a 20 por dia). A lista serve para achar e revisar; o detalhe mostra a **etapa**, o **telefone**, as **atividades** (follow-ups) e as **notas**. É a parte de prospecção
- **Clientes:** foco na **relação com quem já fechou**. O detalhe mostra as propriedades, o faturamento, as métricas de projetos e, à direita, o **financeiro** (receitas e despesas) e os **projetos**

É uma primeira versão funcional, reaproveitando o que já existe, para refinar aos poucos. Somente front-end, com dados mockados tipados pelos contratos Zod e servidos via TanStack Query.

**Referências visuais:** a página de cliente (imagem 27) é a principal referência de **design e estrutura** do detalhe do cliente, adaptada à identidade do Vetra, sem copiar. A prévia de lead (imagem 28) é a referência de **quais informações** mostrar no lead: telefone, etapa em destaque, atividade e notas.

---

## Decisões

- **Duas páginas de detalhe, um registro.** Abrir `/leads/$id` de um lead já fechado redireciona para `/customers/$id`, e o contrário também. Nada é copiado quando um lead vira cliente
- **Mesmo esqueleto, conteúdo diferente:** coluna esquerda fixa com a identidade e os cartões, área direita com as seções. O lead é prospecção (etapa, atividades, notas); o cliente é relação (faturamento, métricas, financeiro, projetos)
- **O cliente não tem atividades nem notas.** É mais fácil de lembrar e o foco dele é financeiro e de projetos
- **Só lista, sem Kanban, por enquanto.** Para Leads o volume torna o Kanban ruim; para Clientes ele pode compensar, e fica para uma próxima task
- **Despesas entram no financeiro do cliente** porque parte do que ele paga é usada para custear o projeto (designer, ferramentas, impostos), e o saldo mostra o que sobra
- **Sem grupos na sidebar por enquanto.** Ela segue com itens soltos
- **Foto de perfil:** avatar com as iniciais. Buscar a foto do WhatsApp automaticamente fica para a integração
- **O mock é temporário:** vai para `shared/` e é usado por todos, sem se preocupar em organizar
- A integração com o Linear será só de análise, dentro do detalhe; nenhuma tarefa do Linear é puxada

---

## Ordem sugerida

1. Mocks e contratos compartilhados
2. Navegação (itens e barra de busca)
3. Lista de Leads
4. Lista de Clientes
5. Esqueleto do detalhe
6. Detalhe do lead
7. Detalhe do cliente: propriedades, faturamento e métricas
8. Detalhe do cliente: abas Financeiro e Projetos

---

## Escopo

### Navegação

- O item "Clientes" volta a se chamar **Leads** (rota `/leads`)
- Novo item **Clientes** (rota `/customers`) entre Leads e WhatsApp
- **Barra de busca** no topo da sidebar, acima do Painel, com a dica de atalho (Ctrl K). Recolhida, vira só o ícone de lupa. Aparece **desabilitada**; a busca (paleta de comandos) é de outra task
- No cabeçalho das páginas de detalhe, o título vira um **caminho** ("Leads › Nome" / "Clientes › Nome")

### Contratos (`packages/contracts`)

- **Item da lista de leads:** o resumo do lead + a próxima ação (descrição e vencimento, ou nulo). **Consulta:** busca, filtro (etapa, "sem próxima ação" ou "perdidos"), página e tamanho. **Resposta:** itens, total e contagem por filtro
- **Item da lista de clientes:** o resumo + valor fechado, recebido, mensalidade, projetos em andamento e total de projetos. Consulta com busca e filtro "com projeto em andamento" / "sem projeto em andamento"
- **Detalhe (lead e cliente):** o resumo + telefone (WhatsApp), documento (CPF ou CNPJ, opcional), e-mail (opcional), link da demo (opcional) e data da última atualização
- **Detalhe do cliente, além disso:** faturamento (recebido, total a receber e restante), métricas de projetos (total, em andamento, concluídos) e o resumo financeiro (receita confirmada e pendente, despesa confirmada e pendente, saldo)
- **Lançamento:** tipo (receita ou despesa), descrição, valor, status (confirmado ou pendente) e data
- **Projeto:** nome, status (em andamento ou concluído), valor e datas
- **Nota** (só de lead): conteúdo e data de criação; criação com texto obrigatório e tamanho máximo

### Dados mockados

- Os mocks do Painel (fixtures e API em memória) passam para `shared/` e são usados por todas as features. Isso inclui o estado das **próximas ações**, para que concluir ou reagendar numa tela apareça nas outras
- Fixtures com algumas dezenas de leads em todas as etapas (para a paginação e os filtros), telefone, e-mail e link da demo em parte deles, e algumas notas
- Clientes com documento, **lançamentos** e **projetos**. As **receitas** vêm das parcelas que o mock do Painel já tem (pagas = confirmadas, abertas = pendentes), para os números do cliente e os do Painel baterem; as despesas são novas
- Endpoints mockados: lista de leads, lista de clientes, detalhe, notas do lead, criar nota, atividades do lead, lançamentos do cliente e projetos do cliente
- Hooks em `queries/` e `mutations/` nas features de leads e de clientes; listas com `keepPreviousData`

### Lista de Leads (`/leads`)

1. **Cabeçalho** — título e **Novo lead** (desabilitado; o formulário é de outra task)
2. **Chips de filtro com contagem:** **Todos** (só os vivos), uma chip por etapa de Prospectado até Proposta enviada (na cor da etapa), **Sem próxima ação** e **Perdidos** (inclui Sem resposta). Numa linha com rolagem no mobile
3. **Busca** por nome do negócio, contato, nicho ou cidade
4. **Tabela:** Negócio (com o contato embaixo), Nicho, Cidade, **Etapa** (badge), **Próxima ação** (descrição e vencimento relativo; atrasada em destaque, "Sem próxima ação" em aviso), Prospectado (data relativa). Nos leads sem ação, o botão **Definir próxima ação** (reaproveita o popover do Painel). Clicar na linha abre o detalhe
5. **Paginação** simples (anterior e próxima, "página X de Y"), 25 por página
6. **Estado na URL** (busca, filtro e página), validado por Zod com os search params do TanStack Router

### Lista de Clientes (`/customers`)

1. **Cabeçalho** — título
2. **Chips:** **Todos**, **Com projeto em andamento** e **Sem projeto em andamento**, com contagem
3. **Busca** por nome, contato, nicho ou cidade
4. **Tabela:** Cliente (nome e contato), Nicho, Cidade, **Valor fechado**, **Recebido** (valor e progresso), **Mensalidade**, **Projetos** (em andamento de total). Clicar na linha abre o detalhe
5. Mesma paginação e estado na URL da lista de Leads

### Esqueleto do detalhe (compartilhado)

- Duas colunas em telas grandes: **esquerda fixa** (estreita, acompanha a rolagem) e **direita** com as seções; em telas pequenas empilham, esquerda primeiro
- Cartões no mesmo estilo das seções do Painel; por isso `DashboardSection`, `SectionEmpty` e `SectionSkeleton` saem de `features/dashboard` para `shared/`
- **Coluna esquerda:** avatar com iniciais, rótulo ("Lead" ou "Cliente"), nome do negócio, contato, os cartões de cada página e, no rodapé, as datas ("Prospectado" e "Atualizado"; no cliente também "Fechado")
- **Estados:** esqueleto ao carregar, vazio por seção e "não encontrado" para um id que não existe

### Detalhe do lead

**Coluna esquerda:** cartão **Informações** com telefone (com abrir no WhatsApp e copiar), e-mail, nicho, cidade e link da demo quando existir.

**Área direita**, nesta ordem:

1. **Etapa** — indicador de progresso com as etapas do funil de Prospectado até Fechado: as passadas marcadas, a atual em destaque na cor da etapa, as seguintes apagadas. Para Perdido e Sem resposta, um selo no lugar do indicador. Só exibe; mudar a etapa fica para depois
2. **Atividades** — as ações agendadas do lead (follow-ups), com concluir (que exige definir a próxima) e reagendar, reaproveitando os componentes do Painel. Sem ação: aviso e botão para definir uma
3. **Notas** — campo para escrever e salvar, e a lista da mais nova para a mais antiga, com data relativa

### Detalhe do cliente

**Coluna esquerda**, três cartões:

- **Propriedades** — telefone (com abrir no WhatsApp e copiar), documento, e-mail, nicho, cidade e link da demo quando existir
- **Faturamento** — recebido (de quanto), restante a receber e a mensalidade
- **Métricas** — total de projetos, em andamento e concluídos

**Área direita**, com abas no estilo da referência:

- **Financeiro** — faixa de indicadores (receita confirmada, receita pendente, despesa confirmada, despesa pendente e saldo, no estilo da faixa do Painel) e, abaixo, a lista de **lançamentos**: valor com sinal e cor (receita em verde, despesa em vermelho), descrição, status (confirmado ou pendente) e data. O saldo é a receita confirmada menos a despesa confirmada
- **Projetos** — a lista de projetos do cliente (nome, status, valor e datas)

Sem atividades e sem notas.

### Pontos de entrada

- Nomes de lead no Painel (ações do dia e sem próxima ação) levam ao detalhe. As conversas continuam abrindo o WhatsApp, porque o item inteiro já é esse link

---

## Regras

- Cores sempre por tokens semânticos; a etapa usa as cores `--stage-*` e o financeiro usa `success` e `destructive`
- Ordenação padrão da lista de Leads: próxima ação com vencimento mais próximo primeiro, atrasadas antes, leads sem ação ao fim. A lista abre só com os leads vivos
- Concluir uma ação **sempre** exige a próxima, igual ao Painel
- A busca espera o usuário parar de digitar antes de consultar
- Datas em PT-BR, relativas quando fizer sentido
- Componentes com ~200 linhas no máximo; o esqueleto, os cartões de informações e as notas são componentes próprios, reaproveitados

---

## Fora do Escopo

- **Kanban** de leads e de clientes (próxima task)
- Criar, editar ou excluir lançamentos e projetos (a página só exibe); o botão de novo registro entra depois
- Margem, progresso detalhado e gráficos do cliente; integração com o Linear
- Mudar a etapa, editar os dados do lead ou do cliente, editar e excluir notas
- Formulário de novo lead, importação do pipeline de captação e deduplicação por WhatsApp
- "Registrar interação" e a timeline de atividades
- Foto de perfil do WhatsApp, busca funcional (paleta de comandos) e agrupamento da sidebar
- Ordenação por coluna, ações em lote, último contato e origem do lead
- Backend e persistência

---

## Componentes shadcn

Instalar o que for preciso, sem aprovação prévia. Previstos: `avatar`, `textarea`, `breadcrumb`, `table`, `input`

---

## Critérios de Aceite

- `pnpm check-types`, `pnpm lint` e `pnpm build` passam
- A sidebar mostra Painel, Leads, Clientes, WhatsApp e Configurações, com a busca desabilitada no topo (e só a lupa quando recolhida)
- A lista de Leads abre sem Fechados, Perdidos e Sem resposta, com a ação mais urgente primeiro; cada chip mostra a contagem certa e filtra; "Perdidos" mostra os perdidos e os sem resposta
- A lista de Clientes mostra só os fechados, com os chips de projeto em andamento
- A busca funciona nas duas listas e combina com o filtro; trocar filtro ou página não faz a tabela piscar; recarregar ou voltar mantém busca, filtro e página
- Clicar numa linha ou no nome de um lead do Painel (ações do dia e sem próxima ação) abre o detalhe; um lead fechado abre na página de cliente e vice-versa
- O detalhe do lead mostra a etapa em destaque, o telefone com abrir no WhatsApp e copiar, as atividades e as notas
- O detalhe do cliente mostra propriedades, faturamento e métricas na esquerda, e as abas Financeiro e Projetos na direita, sem atividades nem notas
- O financeiro do cliente fecha as contas: o saldo é a receita confirmada menos a despesa confirmada, e a receita confirmada e a pendente batem com as parcelas que o Painel usa
- Concluir ou reagendar uma ação no detalhe do lead reflete no Painel, e o contrário também
- Adicionar uma nota a mostra no topo da lista sem recarregar
- Um id inexistente mostra "não encontrado"; esqueleto ao carregar, vazio com filtro e vazio total aparecem corretamente
- Em tela pequena as colunas do detalhe empilham
- Componentes com ~200 linhas no máximo, conforme `WEB-COMPONENTS.md`
