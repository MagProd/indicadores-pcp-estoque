import { FilterX, X } from 'lucide-react'
import { rotulosDimensao, type Dimensao } from '@/domain/filters'
import { fmt } from '@/domain/format'
import { useDataset } from '@/state/DataContext'
import { useFilters } from '@/state/FiltersContext'

/** Exibe as seleções cruzadas ativas da página e permite removê-las. */
export function SelectionChips() {
  const { selecao, limparSelecao } = useFilters()
  const { dataset } = useDataset()
  const ativos = (Object.entries(selecao) as [Dimensao, string | undefined][]).filter(([, v]) => v)

  const rotulo = (dim: Dimensao, v: string) => {
    if (dim === 'familia') return dataset?.familias.find((f) => f.id === v)?.nome ?? v
    if (dim === 'mes') return fmt.mes(v)
    return v
  }

  if (!ativos.length)
    return (
      <p className="text-xs text-slate-400">
        Dica: clique em uma barra, fatia ou mês dos gráficos para aplicar um filtro cruzado em toda a página.
      </p>
    )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">Seleção ativa:</span>
      {ativos.map(([dim, v]) => (
        <button
          key={dim}
          onClick={() => limparSelecao(dim)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 py-1 pr-2 pl-3 text-xs font-medium text-white hover:bg-brand-700"
        >
          {rotulosDimensao[dim]}: {rotulo(dim, v!)}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        onClick={() => limparSelecao()}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
      >
        <FilterX className="size-3.5" /> Limpar tudo
      </button>
    </div>
  )
}
