# Roadmap — Indicadores PCP, Estoque e Planejamento de Materiais

Cada marco é uma entrega pequena e independente. Marque como concluído ao finalizar.

## ✅ Marco 1 — Interface completa com dados fictícios
- Menu lateral fixo, cabeçalho com título, filtros (período, família, código do produto), usuário e data/hora da última atualização.
- Seis painéis navegáveis: Visão Geral, Planejamento de Produção, Estoques, Compras, S&OP e Expedição.
- Filtros cruzados por clique em barras, fatias e meses em todos os painéis.
- Camadas separadas: `domain` (regras/indicadores), `services` (acesso a dados), `auth` (identidade/perfis), `components` e `pages` (visual).
- Perfis de acesso simuláveis no menu do usuário; exportação CSV conforme permissão.

## Marco 2 — Autenticação Microsoft Entra ID
- Criar App Registration (SPA, Authorization Code + PKCE) e App Roles: `Administrador`, `Diretoria`, `PCP`, `Compras`, `Logistica`, `Consulta`.
- Instalar `@azure/msal-browser` / `@azure/msal-react` e implementar `entraAuthAdapter` em `src/auth/authAdapter.ts`.
- Mapear a claim `roles` para `Usuario.perfis`; redirecionar não autenticados para login.
- Configurar variáveis `VITE_ENTRA_*` e `VITE_AUTH_MODE=entra` no ambiente de deploy (valores públicos apenas).

## Marco 3 — API corporativa (BFF) sobre o SQL Server
- Publicar API/BFF corporativa (ou Netlify Functions como camada intermediária) que valide o token Entra ID, aplique autorização por perfil e consulte o SQL Server com credenciais mantidas no servidor.
- Contrato sugerido: `GET /v1/indicadores/dataset` (atual) e, para escala, endpoints por domínio com filtros na query: `/v1/estoque/fatos`, `/v1/producao/ordens`, `/v1/compras/pedidos`, `/v1/expedicao/pedidos`, `/v1/sop/projecao`, `/v1/metadados/atualizacao`.
- Implementar validação de schema das respostas (ex.: zod) no `httpDataSource` antes de mapear para os tipos de domínio.
- Ativar com `VITE_DATA_SOURCE=api` e `VITE_API_BASE_URL`.

## Marco 4 — Desempenho e agregação no servidor
- Mover agregações pesadas (`src/domain/indicators.ts`) para a API, recebendo filtros por parâmetro.
- Cache de respostas e indicador de carga incremental por painel.
- Atualização automática periódica e alerta quando os dados estiverem desatualizados.

## Marco 5 — Metas, alertas e configurações
- Cadastro de metas por indicador/família (hoje fixas: cobertura 45–60 dias, aderência 95%, acuracidade 85%, OTD 95%).
- Painel de exceções (rupturas, excessos, PCs críticos) e notificações.
- Página de administração de perfis (somente `Administrador`).

## Marco 6 — Qualidade e operação
- Testes de componentes e E2E dos fluxos de filtro cruzado e permissões.
- Auditoria de acesso (log de consultas por usuário na API).
- Exportação para Excel/PDF e modo de apresentação para reuniões de S&OP.
