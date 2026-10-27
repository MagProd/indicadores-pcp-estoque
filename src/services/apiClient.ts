import { appConfig } from './config'

/**
 * Cliente HTTP para APIs autenticadas.
 * O token de acesso (Bearer) é obtido do provedor de autenticação ativo
 * (Microsoft Entra ID em produção) por meio de um "token provider" registrado
 * em tempo de execução — o cliente não conhece detalhes de autenticação.
 */
export type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider = async () => null

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const base = new URL(appConfig.apiBaseUrl.replace(/\/?$/, '/'), window.location.origin)
  const url = new URL(path.replace(/^\//, ''), base)
  for (const [k, v] of Object.entries(params ?? {})) if (v) url.searchParams.set(k, v)

  const token = await tokenProvider()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), appConfig.requestTimeoutMs)
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    })
    if (res.status === 401) throw new ApiError('Sessão expirada. Faça login novamente.', 401)
    if (res.status === 403) throw new ApiError('Seu perfil não possui acesso a este recurso.', 403)
    if (!res.ok) throw new ApiError(`Falha ao consultar a API (${res.status}).`, res.status)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}
