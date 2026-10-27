# AGENTS.md — Indicadores PCP

Dashboard corporativo (pt-BR) de PCP/estoque/compras/S&OP/expedição. TanStack Start + React 19 + TypeScript + Tailwind 4 + Recharts. Dados **fictícios** nesta fase. Continue a partir de **PLAN.md** (marco 1 concluído; próximo: Entra ID).

## Estrutura

- `src/routes/` — rotas finas (file-based). `__root.tsx` monta `AuthProvider → DataProvider → FiltersProvider → AppShell`. Cada rota envolve a página em `<PaginaProtegida permissao=...>`.
- `src/pages/` — uma página por painel; recebem `dataset` e usam `useRecorte`.
- `src/components/layout/` — `Sidebar`, `Header` (título, filtros, última atualização, usuário), `FilterBar`, `UserMenu`.
- `src/components/ui/` — `Card`, `KpiCard`, `ChartCard`, `DataTable` (ordenação, paginação, CSV por permissão), `StatusBadge`, `SelectionChips`, `PaginaProtegida`.
- `src/components/charts/` — `BarChartWidget`, `TrendChart` (barras/linhas/áreas, eixo duplo, meta), `DonutChart`, `theme.ts` (paleta).
- `src/domain/` — tipos, `filters.ts` (filtros globais + seleção cruzada), `indicators.ts` (fórmulas puras), `aggregate.ts`, `format.ts`.
- `src/services/` — `config.ts` (env VITE_*), `apiClient.ts` (fetch com Bearer), `dataService.ts` (interface + implementações mock/http).
- `src/auth/` — `roles.ts` (perfis → permissões), `authAdapter.ts` (mock + stub Entra ID), `AuthContext.tsx`.
- `src/mocks/` — catálogo e gerador determinístico (PRNG com semente) de dados fictícios. Único lugar com dados de exemplo.
- `src/app/navigation.ts` — registro de páginas (menu, títulos, ícones, permissões).

## Como estender

- **Nova página**: componente em `src/pages`, rota em `src/routes`, entrada em `navigation.ts`, permissão em `roles.ts`.
- **Novo gráfico**: use `ChartCard` + widget de `components/charts`. Para filtro cruzado, alimente com `fatos(dim)`/`filtrar(rows, { ignorar: dim })` e passe `selecionado={selecao[dim]}` e `onSelecionar={(id) => alternar(dim, id)}`.
- **Nova dimensão de filtro cruzado**: adicione a `Dimensao` e `rotulosDimensao` em `domain/filters.ts`. Registros sem o campo ignoram a dimensão automaticamente; use `resolver` para campos derivados.
- **Novo indicador**: função pura em `domain/indicators.ts` + `KpiCard`.

## Decisões não óbvias

- O gráfico que origina uma seleção ignora a própria dimensão (destaca o item, não esconde os demais). Filtros globais sempre se aplicam.
- Seleções cruzadas são reiniciadas ao trocar de página ou alterar filtros globais; filtros globais persistem entre páginas.
- Dados carregados no cliente (efeito) — SSR renderiza o shell e esqueletos; Recharts só roda no navegador.
- Valor de estoque = posição do último mês do recorte; cobertura = estoque ÷ consumo médio diário; giro = consumo anualizado ÷ estoque médio; acuracidade = 1 − WMAPE.
- Autorização no front é apenas de UX; a API corporativa deve revalidar perfis. Nunca colocar segredos em `VITE_*`; o navegador não acessa o SQL Server.
- Datas formatadas em `America/Sao_Paulo`.

## Comandos

`pnpm dev`, `pnpm test`, `pnpm typecheck` (rodar dev/build antes para gerar `routeTree.gen.ts`). TypeScript fixado na v6 (adaptador Netlify).
