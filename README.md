# Indicadores PCP · Planejamento, Estoque e Materiais

Aplicação web corporativa para acompanhamento dos indicadores de PCP, estoques, compras, S&OP e expedição de uma indústria de equipamentos médicos. Esta versão usa **exclusivamente dados fictícios** para validação de layout e navegação.

## Painéis

| Página | Conteúdo |
| --- | --- |
| Visão Geral | Valor do estoque, cobertura, giro, OPs planejadas × realizadas, acuracidade da previsão, PCs em atraso |
| Planejamento de Produção | Aderência ao plano, capacidade, OPs por linha e status, carteira de OPs |
| Estoques | Evolução por família, curva ABC, cobertura, depósitos, posições abaixo do ES/excesso |
| Compras | PCs por mês e status, atrasos por fornecedor, valor por família |
| S&OP | Demanda × oferta (histórico + 6 meses), acuracidade e viés, plano consolidado |
| Expedição | OTD, backlog, transportadoras, regiões, pedidos de venda |

Todos os gráficos suportam **filtro cruzado**: clique em uma barra, fatia ou mês para filtrar os demais indicadores da página. Clique novamente (ou no chip de seleção) para remover.

## Tecnologias

- React 19 + TypeScript, TanStack Start/Router
- Tailwind CSS 4
- Recharts
- Lucide (ícones)
- Netlify (hospedagem)

## Executando localmente

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # testes unitários dos indicadores e filtros
```

Variáveis opcionais estão em `.env.example` (somente valores públicos).

## Arquitetura e segurança

- **Camada visual** (`src/pages`, `src/components`) separada da **camada de dados** (`src/services`) e das **regras** (`src/domain`).
- `VITE_DATA_SOURCE=mock|api` alterna entre dados fictícios e a API corporativa — sem mudar as páginas.
- O navegador **nunca** acessa o SQL Server: a API corporativa (BFF) faz a consulta com credenciais no servidor.
- Autenticação preparada para **Microsoft Entra ID** (`src/auth/authAdapter.ts`), com token Bearer injetado no cliente HTTP.
- Perfis de acesso (`src/auth/roles.ts`) controlam menu, páginas e exportação. No modo demonstração, o perfil pode ser simulado pelo menu do usuário.
- Data e hora da última atualização exibidas no cabeçalho.

## Roadmap

Veja [PLAN.md](./PLAN.md): Entra ID, API corporativa sobre SQL Server, agregação no servidor, metas configuráveis e alertas.
