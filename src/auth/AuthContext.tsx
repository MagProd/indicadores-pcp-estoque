import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setTokenProvider } from '@/services/apiClient'
import { appConfig } from '@/services/config'
import { authAdapter, type Usuario } from './authAdapter'
import { temPermissao, type Perfil, type Permissao } from './roles'

interface AuthState {
  usuario: Usuario | null
  carregando: boolean
  pode: (permissao: Permissao) => boolean
  logout: () => Promise<void>
  /** Disponível apenas no modo de demonstração, para validar os perfis. */
  simularPerfil?: (perfil: Perfil) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setTokenProvider(() => authAdapter.getAccessToken())
    authAdapter
      .init()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }, [])

  const pode = useCallback(
    (permissao: Permissao) => (usuario ? temPermissao(usuario.perfis, permissao) : false),
    [usuario],
  )

  const value = useMemo<AuthState>(
    () => ({
      usuario,
      carregando,
      pode,
      logout: () => authAdapter.logout(),
      simularPerfil:
        appConfig.authMode === 'mock'
          ? (perfil) => setUsuario((u) => (u ? { ...u, perfis: [perfil] } : u))
          : undefined,
    }),
    [usuario, carregando, pode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
