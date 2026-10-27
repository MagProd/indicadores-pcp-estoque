import { periodos, type Periodo } from '@/domain/filters'
import type { FamiliaId } from '@/domain/types'
import { useDataset } from '@/state/DataContext'
import { useFilters } from '@/state/FiltersContext'

function Select({
  label,
  value,
  onChange,
  children,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      >
        {children}
      </select>
    </label>
  )
}

export function FilterBar() {
  const { dataset } = useDataset()
  const { filtros, setFiltros } = useFilters()
  const produtos = (dataset?.produtos ?? []).filter((p) => filtros.familia === 'todas' || p.familia === filtros.familia)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select label="Período" value={filtros.periodo} onChange={(v) => setFiltros({ periodo: v as Periodo })} className="w-40">
        {periodos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </Select>
      <Select
        label="Família de produtos"
        value={filtros.familia}
        onChange={(v) => setFiltros({ familia: v as FamiliaId | 'todas' })}
        className="w-56"
      >
        <option value="todas">Todas as famílias</option>
        {dataset?.familias.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </Select>
      <Select label="Código do produto" value={filtros.produto} onChange={(v) => setFiltros({ produto: v })} className="w-64">
        <option value="todos">Todos os produtos</option>
        {produtos.map((p) => (
          <option key={p.codigo} value={p.codigo}>
            {p.codigo} · {p.descricao}
          </option>
        ))}
      </Select>
    </div>
  )
}
