import { MousePointerClick } from 'lucide-react'
import { Card } from './Card'

export function ChartCard({
  titulo,
  subtitulo,
  acoes,
  interativo,
  children,
  className = '',
  altura = 300,
}: {
  titulo: string
  subtitulo?: string
  acoes?: React.ReactNode
  /** Mostra a dica de que o gráfico aplica filtro cruzado ao clicar. */
  interativo?: boolean
  children: React.ReactNode
  className?: string
  altura?: number
}) {
  return (
    <Card className={`flex flex-col p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{titulo}</h2>
          {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}
        </div>
        <div className="flex items-center gap-2">
          {acoes}
          {interativo && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-500" title="Clique em uma barra ou categoria para filtrar os demais indicadores">
              <MousePointerClick className="size-3.5" /> Filtro cruzado
            </span>
          )}
        </div>
      </div>
      <div style={{ height: altura }} className="min-w-0">
        {children}
      </div>
    </Card>
  )
}
