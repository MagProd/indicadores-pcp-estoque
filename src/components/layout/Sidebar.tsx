import { Link } from '@tanstack/react-router'
import { Activity, ShieldCheck } from 'lucide-react'
import { paginas } from '@/app/navigation'
import { useAuth } from '@/auth/AuthContext'

export function Sidebar() {
  const { pode } = useAuth()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[76px] flex-col border-r border-slate-200 bg-white xl:w-64">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
          <Activity className="size-5" strokeWidth={2.4} />
        </div>
        <div className="hidden leading-tight xl:block">
          <p className="text-sm font-semibold text-slate-900">Indicadores PCP</p>
          <p className="text-[11px] text-slate-500">Planejamento & Estoque</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegação principal">
        <p className="mb-2 hidden px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase xl:block">
          Painéis
        </p>
        {paginas.map((p) => {
          const permitido = pode(p.permissao)
          const Icone = p.icone
          return (
            <Link
              key={p.path}
              to={p.path}
              title={permitido ? p.titulo : `${p.titulo} — sem permissão`}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                permitido ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-300'
              }`}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'bg-brand-50! text-brand-700!' }}
            >
              <Icone className="size-5 shrink-0" />
              <span className="hidden xl:inline">{p.titulo}</span>
            </Link>
          )
        })}
      </nav>

      <div className="m-3 hidden rounded-xl border border-slate-100 bg-slate-50 p-3 xl:block">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="size-4 text-brand-600" />
          Ambiente de validação
        </div>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Todos os valores exibidos são fictícios e servem apenas para validação de layout.
        </p>
      </div>
    </aside>
  )
}
