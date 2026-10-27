import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { fmt } from '@/domain/format'
import { Card } from './Card'

export interface KpiCardProps {
  titulo: string
  valor: string
  icone: LucideIcon
  detalhe?: React.ReactNode
  /** Variação relativa (ex.: 0.05 = +5%). */
  variacao?: number
  /** Define se aumento é bom (verde) ou ruim (vermelho). */
  maiorMelhor?: boolean
  /** Barra de progresso opcional (0–1) com meta. */
  progresso?: { valor: number; meta?: number }
  tom?: 'brand' | 'teal' | 'amber' | 'rose' | 'violet' | 'slate'
}

const tons = {
  brand: 'bg-brand-50 text-brand-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-600',
}

export function KpiCard({ titulo, valor, icone: Icone, detalhe, variacao, maiorMelhor = true, progresso, tom = 'brand' }: KpiCardProps) {
  const positivo = variacao !== undefined && variacao >= 0
  const bom = variacao !== undefined && (positivo === maiorMelhor)
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] leading-snug font-medium text-slate-500">{titulo}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tons[tom]}`}>
          <Icone className="size-[18px]" />
        </span>
      </div>
      <p className="text-[28px] leading-none font-semibold tracking-tight text-slate-900">{valor}</p>
      {progresso && (
        <div className="relative h-1.5 rounded-full bg-slate-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
            style={{ width: `${Math.min(100, progresso.valor * 100)}%` }}
          />
          {progresso.meta !== undefined && (
            <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-slate-500" style={{ left: `${progresso.meta * 100}%` }} title="Meta" />
          )}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {variacao !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
              bom ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {positivo ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {fmt.pct(Math.abs(variacao))}
          </span>
        )}
        {detalhe && <span className="text-slate-500">{detalhe}</span>}
      </div>
    </Card>
  )
}
