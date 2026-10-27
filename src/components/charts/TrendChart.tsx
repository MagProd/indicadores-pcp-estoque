import { Area, Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Ponto } from './BarChartWidget'
import { cores, eixoProps, opacidade, tooltipProps } from './theme'

const RAIO: [number, number, number, number] = [4, 4, 0, 0]

export interface SerieTendencia {
  chave: string
  nome: string
  cor: string
  tipo: 'linha' | 'barra' | 'area'
  /** Eixo secundário (direita), útil para percentuais. */
  eixoDireito?: boolean
  tracejada?: boolean
  pilha?: string
}

interface Props {
  dados: Ponto[]
  series: SerieTendencia[]
  formatarValor?: (v: number) => string
  formatarDireito?: (v: number) => string
  selecionado?: string
  onSelecionar?: (id: string) => void
  meta?: { valor: number; rotulo: string; eixoDireito?: boolean }
  dominioDireito?: [number, number]
}

/** Gráfico temporal combinado (barras + linhas + áreas). Clique seleciona o mês. */
export function TrendChart({
  dados,
  series,
  formatarValor = (v) => String(v),
  formatarDireito,
  selecionado,
  onSelecionar,
  meta,
  dominioDireito,
}: Props) {
  const temDireito = series.some((s) => s.eixoDireito)
  const fmtDir = formatarDireito ?? formatarValor
  const rotuloSel = dados.find((d) => d.id === selecionado)?.rotulo

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={dados}
        margin={{ top: 8, right: temDireito ? 0 : 12, bottom: 0, left: -4 }}
        onClick={(estado: unknown) => {
          const i = (estado as { activeIndex?: number | string | null } | null)?.activeIndex
          if (onSelecionar && i !== null && i !== undefined && dados[Number(i)]) onSelecionar(dados[Number(i)].id)
        }}
        style={{ cursor: onSelecionar ? 'pointer' : 'default' }}
      >
        <defs>
          {series
            .filter((s) => s.tipo === 'area')
            .map((s) => (
              <linearGradient key={s.chave} id={`grad-${s.chave}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.cor} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.cor} stopOpacity={0.02} />
              </linearGradient>
            ))}
        </defs>
        <CartesianGrid stroke={cores.grade} vertical={false} />
        <XAxis dataKey="rotulo" {...eixoProps} />
        <YAxis yAxisId="esq" {...eixoProps} width={64} tickFormatter={(v: number) => formatarValor(v)} />
        {temDireito && (
          <YAxis yAxisId="dir" orientation="right" {...eixoProps} width={52} domain={dominioDireito} tickFormatter={(v: number) => fmtDir(v)} />
        )}
        <Tooltip
          {...tooltipProps}
          formatter={(v, _n, item) => {
            const s = series.find((x) => x.chave === item?.dataKey)
            return s?.eixoDireito ? fmtDir(Number(v)) : formatarValor(Number(v))
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {rotuloSel && <ReferenceLine x={rotuloSel} yAxisId="esq" stroke={cores.primaria} strokeDasharray="4 4" />}
        {meta && (
          <ReferenceLine
            y={meta.valor}
            yAxisId={meta.eixoDireito ? 'dir' : 'esq'}
            stroke={cores.vermelho}
            strokeDasharray="5 4"
            label={{ value: meta.rotulo, position: 'insideTopRight', fill: cores.vermelho, fontSize: 11 }}
          />
        )}
        {series.map((s) => {
          const eixo = s.eixoDireito ? 'dir' : 'esq'
          if (s.tipo === 'barra')
            return (
              <Bar key={s.chave} yAxisId={eixo} dataKey={s.chave} name={s.nome} fill={s.cor} stackId={s.pilha} maxBarSize={28} radius={s.pilha ? 0 : RAIO}>
                {dados.map((p) => (
                  <Cell key={p.id} fill={s.cor} fillOpacity={opacidade(selecionado, p.id)} />
                ))}
              </Bar>
            )
          if (s.tipo === 'area')
            return (
              <Area
                key={s.chave}
                yAxisId={eixo}
                type="monotone"
                dataKey={s.chave}
                name={s.nome}
                stroke={s.cor}
                strokeWidth={2}
                fill={`url(#grad-${s.chave})`}
                stackId={s.pilha}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )
          return (
            <Line
              key={s.chave}
              yAxisId={eixo}
              type="monotone"
              dataKey={s.chave}
              name={s.nome}
              stroke={s.cor}
              strokeWidth={2.25}
              strokeDasharray={s.tracejada ? '6 4' : undefined}
              dot={{ r: 2.5, strokeWidth: 0, fill: s.cor }}
              activeDot={{ r: 5 }}
            />
          )
        })}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
