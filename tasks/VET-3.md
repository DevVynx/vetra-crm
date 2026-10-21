# VET-3 — Página Painel (Hoje + Dashboard) com dados mockados

## Objetivo

Construir a página principal do Vetra, o **Painel** (rota `/`), que une o que antes seriam duas páginas — "Hoje" e "Dashboard". Ela responde, numa tela só, **como está o funil** e **o que preciso fazer agora para não perder venda**. As ações são o protagonista; no topo ficam os indicadores de dinheiro e de negociação, e ao lado um gráfico de funil.

Somente front-end: todos os dados vêm de mocks tipados pelos contratos Zod, servidos via TanStack Query, para que a troca pelo backend real mude apenas as `queryFn`.

---

## Escopo

### Navegação

- Renomear o item "Hoje" para **Painel** (rota `/`, título "Painel")
- Remover a aba e a rota **Dashboard** — a V1 fica com Painel, Leads, WhatsApp e Configurações

### Contratos (`packages/contracts`)

Schemas Zod + tipos para o que a página consome — apenas os campos necessários agora, a serem estendidos nas próximas tasks:

- `leads`: etapa do funil (enum) e o resumo do lead usado em listas (nome do negócio, contato, nicho, cidade, etapa). Sem valor estimado: o lead guarda só o **valor fechado**
- Registro pós-venda mínimo do lead fechado: valor fechado, parcelas (valor, vencimento, pago ou não), mensalidade recorrente e status do projeto (em produção / entregue)
- Próxima ação: descrição, data de vencimento, lead associado
- Conversa (resumo): lead associado, prévia da última mensagem, data da última mensagem recebida
- Resumo do painel: vendido no mês, recebido no mês, a receber, recorrente mensal, projetos ativos, leads em negociação e o funil (quantos leads alcançaram cada etapa)

### Dados mockados (`apps/web/src/features/dashboard`)

- Fixtures tipadas pelos contratos, com datas relativas a "agora" (atrasadas, de hoje, próximos dias) para a tela sempre parecer viva
- Hooks de query em `queries/` (`queryOptions` + `useX`), retornando os mocks
- Mutations em `mutations/` alterando o cache local (concluir e reagendar refletem na tela sem backend)

### Página

1. **Cabeçalho** — data e saudação com o nome ("Boa tarde, Vinícius", mockado; configurável depois). À direita, nesta ordem:
   - **Novo lead** (contorno) — leva a `/leads`
   - **Novo projeto** (azul, ícone de caixa) — só layout; ganha ação quando existir a aba Projetos
   - **Registrar interação** (desabilitado)
   - **Seletor de período** (ícone de calendário): Esta semana, **Este mês** (padrão), Últimos 6 meses, Este ano e Todo o período. "Personalizado" fica para depois
2. **Indicadores** — faixa de células unidas, cada uma com ícone e rótulo coloridos, valor e linha de contexto:
   - **Recebido** e **Vendido** — somam o que aconteceu no período escolhido e mostram, no canto superior direito, a variação contra o período anterior do mesmo tamanho, até o mesmo ponto (ex.: mês atual até hoje × mês passado até o mesmo dia). Sem variação em "Todo o período" ou quando o anterior é zero
   - **A receber**, **Recorrente** (valor "/mês"), **Projetos ativos** e **Em negociação** — mostram o estado atual, não mudam com o período e ficam sem variação por enquanto
3. **Abas** logo abaixo dos indicadores, que trocam a área de baixo sem rolar a página. A aba **Operação** abre por padrão e mostra quantas pendências existem (ações atrasadas e de hoje + conversas esperando), para que o urgente nunca fique escondido:
   - **Operação** — Ações do dia, Conversas esperando você e Sem próxima ação
   - **Desempenho** — gráfico de área **Recebido × Vendido** (acumulado no período, segue o seletor; um ponto por dia em semana/mês e por mês nos demais) e o **Funil de vendas**

### Aba Operação

- **Ações do dia** (coluna principal) — atrasadas (com destaque e "há N dias") e de hoje; cada item mostra lead, nicho/cidade, etapa, descrição da ação e vencimento, com ações rápidas:
  - **WhatsApp** — leva à aba WhatsApp
  - **Reagendar** — opções rápidas (amanhã, +2 dias, próxima semana) ou data escolhida
  - **Concluir** — exige definir a próxima ação, já sugerida pela cadência (ex.: "Follow-up 2 · em 3 dias"); um clique confirma
- **Conversas esperando você** (lateral) — mensagens recebidas de leads ainda sem resposta, com prévia e tempo desde a chegada
- **Sem próxima ação** (lateral) — leads ativos sem próximo passo, com ação "definir próxima ação"

### Aba Desempenho

- **Recebido × Vendido** — gráfico de área (componente `chart`, Recharts) com as duas séries juntas; o espaço entre elas é o que ainda vai entrar
- **Funil de vendas** — gráfico de funil com quantos leads alcançaram cada etapa, de Prospectado a Fechado, e a conversão entre etapas

### Geral

- **Estados vazios** — "Tudo em dia" quando não houver pendências, e vazio por seção

---

## Regras

- Cores sempre por tokens semânticos (`success`, `warning`, `info`, uma cor por etapa do funil e `chart-*`), documentados no `DESIGN-TOKENS.md`
- Concluir uma ação **sempre** exige a próxima (exceto ao marcar o lead como fechado/perdido, que fica fora desta task)
- A sugestão da próxima ação segue uma cadência padrão mockada (D+2 → D+5 → D+10); a cadência configurável é da página Configurações
- Datas exibidas em PT-BR, relativas quando fizer sentido ("há 2 dias", "em 3 dias")

---

## Fora do Escopo

- "Registrar interação" — o botão aparece desabilitado; a ação entra com a timeline, na task do detalhe do lead
- Página de métricas de análise (taxa de resposta, desempenho das abordagens) e gráfico de atividade
- Filtro real de Leads por etapa, detalhe do lead e conversa real do WhatsApp (as ações apenas navegam)
- Backend, persistência e cadência configurável

---

## Componentes shadcn necessários (instalar com aprovação)

`badge`, `popover`, `calendar`, `dropdown-menu`, `empty`, `item`, `scroll-area`, `chart`, `tabs`

---

## Critérios de Aceite

- `pnpm check-types`, `pnpm lint` e `pnpm build` passam
- Sidebar mostra Painel, Leads, WhatsApp e Configurações; `/dashboard` não existe mais
- Todas as seções renderizam a partir dos mocks, via hooks de query (nenhum dado hardcoded em componente)
- Concluir uma ação pede a próxima com sugestão pré-preenchida; ao confirmar, a ação sai da lista do dia
- Reagendar move a ação para a data escolhida
- Com os mocks esvaziados, os estados vazios aparecem corretamente
- Componentes com ~200 linhas no máximo, conforme `WEB-COMPONENTS.md`
