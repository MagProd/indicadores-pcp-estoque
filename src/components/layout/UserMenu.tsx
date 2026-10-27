import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserCog } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { perfis } from '@/auth/roles'

export function UserMenu() {
  const { usuario, simularPerfil, logout } = useAuth()
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fechar = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setAberto(false)
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  if (!usuario) return <div className="h-10 w-44 animate-pulse rounded-lg bg-slate-100" />

  const iniciais = usuario.nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((a) => !a)}
        className="flex items-center gap-3 rounded-lg py-1.5 pr-2 pl-1.5 hover:bg-slate-50"
        aria-expanded={aberto}
        aria-haspopup="menu"
      >
        <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {iniciais}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-semibold text-slate-800">{usuario.nome}</span>
          <span className="block text-xs text-slate-500">{usuario.perfis.join(', ')}</span>
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {aberto && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="border-b border-slate-100 px-3 pt-1 pb-3">
            <p className="text-sm font-semibold text-slate-800">{usuario.nome}</p>
            <p className="text-xs text-slate-500">{usuario.cargo}</p>
            <p className="text-xs text-slate-400">{usuario.email}</p>
          </div>
          {simularPerfil && (
            <div className="border-b border-slate-100 px-1 py-2">
              <p className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <UserCog className="size-3.5" /> Simular perfil (demonstração)
              </p>
              {perfis.map((p) => (
                <button
                  key={p.id}
                  role="menuitemradio"
                  aria-checked={usuario.perfis.includes(p.id)}
                  onClick={() => simularPerfil(p.id)}
                  className={`flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-slate-50 ${
                    usuario.perfis.includes(p.id) ? 'bg-brand-50' : ''
                  }`}
                >
                  <span className={`text-sm ${usuario.perfis.includes(p.id) ? 'font-semibold text-brand-700' : 'text-slate-700'}`}>
                    {p.id}
                  </span>
                  <span className="text-[11px] text-slate-500">{p.descricao}</span>
                </button>
              ))}
            </div>
          )}
          <button
            role="menuitem"
            onClick={() => {
              setAberto(false)
              void logout()
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      )}
    </div>
  )
}
