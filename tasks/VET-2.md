# VET-2 — Layout base: Base UI, tema escuro e sidebar recolhível

## Objetivo

Criar a estrutura visual base do Vetra — fundo escuro com a área principal como um painel arredondado sobre ele, e uma sidebar que expande/recolhe — inspirada nas referências do Linear e de um painel de projetos. Junto, adotar o **Base UI** (no lugar do Radix) como padrão dos componentes shadcn/ui e fixar o **tema escuro** como único tema por enquanto.

Nenhuma funcionalidade do CRM entra aqui: as páginas são apenas placeholders para a navegação funcionar.

---

## Escopo

### 1. Migração do shadcn/ui para Base UI

- `components.json`: `style` passa de `default` (legado, só Radix) para **`base-nova`**
- Corrigir aliases inválidos do `components.json`: `utils` → `@/shared/utils/cn`, `hooks` → `@/shared/hooks`
- Reinstalar os primitives existentes na variante Base UI (um por vez, via CLI): button, card, field, input, label, separator, spinner
- `sonner` não usa Radix — mantido como está
- Ajustar os consumidores (`ThemeToggle`, `AppProviders`) às novas APIs (`asChild` → `render`)
- Remover as dependências `@radix-ui/*` que ficarem sem uso; adicionar `@base-ui/react`

### 2. Tema escuro fixo

- O app usa somente o tema escuro (classe `dark` fixa no `<html>`)
- `ThemeProvider` e `ThemeToggle` permanecem no código, sem uso, para um futuro switch de tema
- Ajustar os tokens do tema escuro em `index.css` para a composição das referências: fundo externo/sidebar mais escuros e painel principal levemente mais claro, com borda sutil
- Cores sempre via variáveis globais/tokens (`DESIGN-TOKENS.md`), nunca hex hardcoded em componente

### 3. Layout (app shell)

- Componente **Sidebar** do shadcn (Base UI), com `variant="inset"` e `collapsible="icon"`
  - Recolhida: apenas ícones, com tooltip com o nome do item
  - Expandida: ícones + nomes
  - Alternância por botão (`SidebarTrigger`) e atalho `Ctrl+B`; estado lembrado entre visitas
  - Em telas pequenas, vira menu deslizante (comportamento nativo do componente)
- Cabeçalho da sidebar com a logo (temporária: o ícone atual do template, até a logo do Vetra ser enviada) e o nome "Vetra"
- Itens de navegação: **Hoje**, **Leads**, **Dashboard**; **Configurações** no rodapé da sidebar
- Área principal (`SidebarInset`) com um cabeçalho fino contendo o `SidebarTrigger` e o título da página
- O layout vive em `routes/_app.tsx`; cada item da navegação tem uma rota placeholder em `routes/_app/` com um estado vazio simples

---

## Fora do escopo

- Qualquer funcionalidade do CRM (lista de leads, formulários, dados)
- Logo definitiva, tipografia e identidade visual completa
- Switch de tema

---

## Critérios de Aceite

- `pnpm check-types`, `pnpm lint` e `pnpm build` passam
- Nenhum import de `@radix-ui/*` em `apps/web/src`
- O app abre no tema escuro, com fundo escuro e painel principal arredondado
- A sidebar expande/recolhe pelo botão e por `Ctrl+B`, e mantém o estado ao recarregar
- Recolhida, cada item mostra seu nome em tooltip
- Os quatro itens navegam para suas rotas, com o item ativo destacado
