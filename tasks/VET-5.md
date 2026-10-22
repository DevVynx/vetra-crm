# VET-5 — Leads e Clientes: etapa, criação, edição, lote e atalhos (mockado)

## Objetivo

Tirar o CRM do modo "só leitura": mudar a etapa do lead, arquivar, excluir, criar e editar leads, clientes, atividades, registros e projetos, agir em vários leads de uma vez e usar o teclado. Somente front-end, com o mock atual. O sistema não tem como saber sozinho quando houve reunião, proposta ou fechamento, então tudo isso é manual por enquanto (a IA automatiza depois, e o fluxo manual precisa continuar fácil).

---

## Decisões

### Etapa, arquivar e excluir
- **Etapa clicável no stepper.** Clicar em qualquer etapa muda direto, para frente ou para trás, pulando etapas se preciso. Sem diálogo, com toast "Etapa alterada para X" e **Desfazer**
- **Fechado abre uma sheet** com valor fechado e vencimento da primeira parcela. O lead só vira cliente com isso preenchido (parcela única pendente; parcelas e mensalidade se ajustam depois)
- **Arquivar é uma ação só**, no menu do lead (substitui "Marcar como Sem resposta" e "Marcar como Perdido"). O diálogo de confirmação deixa escolher entre Sem resposta (padrão) e Perdido
- **Arquivar não apaga.** Os arquivados somem da lista padrão e ficam no filtro **Arquivados**; o lead guarda em que etapa parou, e o funil conta o lead até ali. **Reativar** volta para essa etapa
- **Excluir** existe, com confirmação em modal, para criações de teste e registros sem motivo de arquivo
- **Todo toast de alteração tem Desfazer**, por padrão
- **Arquivar automático após 14 dias sem resposta fica para o backend.** O custo operacional ainda não está decidido

### Criar e editar
- **Criar lead e criar cliente de verdade**, com formulário em sheet. O cliente nasce de um lead fechado, então "Novo cliente" cria o registro já fechado (com valor e vencimento)
- **Editar lead e editar cliente** usam a mesma sheet; só o cliente tem documento
- **Nova atividade** no detalhe do lead abre uma sheet e reaproveita o formulário de próxima ação
- **Novo registro** e **Novo projeto** no detalhe do cliente ficam ativos, e os registros do financeiro ganham editar e excluir
- **Notas** ficam no painel esquerdo do lead, com adicionar, editar e excluir; Enter salva, Esc cancela e sair do campo só fecha quando não há nada a perder

### Lista de leads
- **Ações em lote sem checkbox fixa.** Um botão **Selecionar** liga o modo de seleção; só então aparecem as caixas e uma barra de ações (Arquivar, Mudar etapa). Fechado fica de fora do lote
- **Coluna "Último contato"** com o tempo relativo: dias até uma semana, depois semanas, meses e anos

### Teclado
- **N** abre o "novo" da tela: lead (Painel e Leads), cliente (Clientes), atividade (detalhe do lead), registro ou projeto (detalhe do cliente, conforme a aba)
- **/** foca a busca da lista; **↑ ↓** navegam pelas linhas e **Enter** abre
- Os atalhos não disparam enquanto se digita num campo ou há um diálogo aberto

### Menus
- Todos os menus "..." têm ícones, e os itens mostram cursor de clique

### Painel
- O botão **Registrar interação** sai. Registrar interação é adicionar atividade no detalhe do lead; a IA fará o resto

---

## Fora do Escopo

- Páginas de **WhatsApp** e **Configurações**
- **Ordenação por coluna** nas listas (fica para depois)
- Arquivamento automático, sugestão por inatividade e motivo da perda
- Kanban de leads e de clientes
- Etapas que o sistema detectaria sozinho (Prospectado ao criar, Abordagem enviada ao mandar mensagem), que dependem do backend e do WhatsApp
- Paleta de comandos (Ctrl+K) e a busca da sidebar
- Backend e persistência
