import { useRouterState } from '@tanstack/react-router'
import { Clock, RefreshCw } from 'lucide-react'
import { paginaPorPath } from '@/app/navigation'
import { fmt } from '@/domain/format'
import { useDataset } from '@/state/DataContext'
import { FilterBar } from './FilterBar'
import { UserMenu } from './UserMenu'

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const pagina = paginaPorPath(pathname)
  const { dataset, carregando, recarregar } = useDataset()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-6 px-6 2xl:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-slate-900">{pagina.titulo}</h1>
          <p className="truncate text-xs text-slate-500">{pagina.subtitulo}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
            <Clock className="size-4 text-slate-400" />
            <div className="leading-tight">
              <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">Última atualização</p>
              <p className="text-xs font-semibold text-slate-700">
                {dataset ? fmt.dataHora(dataset.atualizadoEm) : '—'}
              </p>
            </div>
            <button
              onClick={recarregar}
              className="ml-1 rounded-md p-1 text-slate-400 hover:bg-white hover:text-brand-600"
              title="Recarregar dados"
              aria-label="Recarregar dados"
            >
              <RefreshCw className={`size-4 ${carregando ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <UserMenu />
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 px-6 py-3 2xl:px-8">
        <FilterBar />
        {dataset && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            {dataset.origem}
          </span>
        )}
      </div>
    </header>
  )
}
