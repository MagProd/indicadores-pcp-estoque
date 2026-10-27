import { appConfig } from '@/services/config'
import type { Perfil } from './roles'

export interface Usuario {
  id: string
  nome: string
  email: string
  cargo: string
  perfis: Perfil[]
}

/**
 * Abstração do provedor de identidade. A aplicação usa apenas esta interface,
 * permitindo trocar o adaptador de demonstração pelo Microsoft Entra ID.
 */
export interface AuthAdapter {
  init(): Promise<Usuario | null>
  login(): Promise<Usuario | null>
  logout(): Promise<void>
  /** Token de acesso para a API corporativa (escopo configurado). */
  getAccessToken(): Promise<string | null>
}

/** Usuário FICTÍCIO usado somente no modo de demonstração. */
const usuarioDemo: Usuario = {
  id: 'demo-0001',
  nome: 'Ana Ribeiro',
  email: 'ana.ribeiro@exemplo.com',
  cargo: 'Coordenadora de PCP',
  perfis: ['Administrador'],
}

export const mockAuthAdapter: AuthAdapter = {
  async init() {
    return usuarioDemo
  },
  async login() {
    return usuarioDemo
  },
  async logout() {},
  async getAccessToken() {
    return null
  },
}

/**
 * Adaptador Microsoft Entra ID (preparado, ainda não ativo).
 *
 * Para ativar (ver PLAN.md, marco 2):
 *  1. `pnpm add @azure/msal-browser @azure/msal-react`
 *  2. Criar o PublicClientApplication com `entraMsalConfig` abaixo.
 *  3. `init`: handleRedirectPromise() + getActiveAccount().
 *  4. `login`: loginRedirect({ scopes: [apiScope] }).
 *  5. `getAccessToken`: acquireTokenSilent({ scopes: [apiScope] }).
 *  6. Mapear a claim `roles` do ID token para `Usuario.perfis`.
 * Fluxo: Authorization Code + PKCE (SPA) — sem client secret no navegador.
 */
export const entraMsalConfig = {
  auth: {
    clientId: appConfig.entra.clientId,
    authority: `https://login.microsoftonline.com/${appConfig.entra.tenantId}`,
    redirectUri: appConfig.entra.redirectUri,
  },
  cache: { cacheLocation: 'sessionStorage' as const },
}

export const entraAuthAdapter: AuthAdapter = {
  async init() {
    throw new Error('Autenticação Microsoft Entra ID ainda não configurada.')
  },
  async login() {
    throw new Error('Autenticação Microsoft Entra ID ainda não configurada.')
  },
  async logout() {},
  async getAccessToken() {
    return null
  },
}

export const authAdapter: AuthAdapter = appConfig.authMode === 'entra' ? entraAuthAdapter : mockAuthAdapter
