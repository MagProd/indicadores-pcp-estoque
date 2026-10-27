import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { opacidade, tooltipProps } from './theme'

export interface Fatia {
  id: string
  rotulo: string
  valor: number
  cor: string
}

interface Props {
  dados: Fatia[]
  formatarValor?: (v: number) => string
  selecionado?: string
  onSelecionar?: (id: string) => void
  centro?: { valor: string; rotulo: string }
}

/** Rosca com legenda lateral clicável (filtro cruzado). */
export function DonutChart({ dados, formatarValor = (v) => String(v), selecionado, onSelecionar, centro }: Props) {
  const total = dados.reduce((s, d) => s + d.valor, 0)
  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip {...tooltipProps} formatter={(v) => formatarValor(Number(v))} />
            <Pie data={dados} dataKey="valor" nameKey="rotulo" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
              {dados.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.cor}
                  fillOpacity={opacidade(selecionado, d.id)}
                  style={{ cursor: onSelecionar ? 'pointer' : 'default' }}
                  onClick={() => onSelecionar?.(d.id)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centro && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">{centro.valor}</p>
              <p className="text-[11px] text-slate-500">{centro.rotulo}</p>
            </div>
          </div>
        )}
      </div>
      <ul className="w-[46%] space-y-1">
        {dados.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => onSelecionar?.(d.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-slate-50 ${
                selecionado === d.id ? 'bg-brand-50' : ''
              }`}
              style={{ opacity: opacidade(selecionado, d.id) === 1 ? 1 : 0.55 }}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.cor }} />
              <span className="min-w-0 flex-1 truncate text-slate-600">{d.rotulo}</span>
              <span className="font-semibold text-slate-800 tabular-nums">{total ? `${Math.round((d.valor / total) * 100)}%` : '—'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
