/**
 * Configuração pública da aplicação, lida de variáveis de ambiente VITE_*.
 * Somente valores NÃO sensíveis podem ficar aqui (são embutidos no bundle).
 * Segredos (connection strings do SQL Server, client secrets) ficam
 * exclusivamente no backend/API corporativa — nunca no navegador.
 */
export type DataSourceMode = 'mock' | 'api'
export type AuthMode = 'mock' | 'entra'

const env = import.meta.env

export const appConfig = {
  /** "mock" usa dados fictícios locais; "api" consome a API corporativa. */
  dataSource: (env.VITE_DATA_SOURCE as DataSourceMode) || 'mock',
  /** URL base da API corporativa (BFF/API Gateway) que acessa o SQL Server. */
  apiBaseUrl: (env.VITE_API_BASE_URL as string) || '/api',
  authMode: (env.VITE_AUTH_MODE as AuthMode) || 'mock',
  entra: {
    /** IDs públicos do App Registration (não são segredos). */
    clientId: (env.VITE_ENTRA_CLIENT_ID as string) || '',
    tenantId: (env.VITE_ENTRA_TENANT_ID as string) || '',
    redirectUri: (env.VITE_ENTRA_REDIRECT_URI as string) || '',
    /** Escopo exposto pela API corporativa, ex.: api://<app-id>/Indicadores.Read */
    apiScope: (env.VITE_ENTRA_API_SCOPE as string) || '',
  },
  requestTimeoutMs: 20000,
} as const
