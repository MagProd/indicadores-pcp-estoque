import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cores, eixoProps, opacidade, tooltipProps } from './theme'

const RAIO_HORIZONTAL: [number, number, number, number] = [0, 4, 4, 0]
const RAIO_VERTICAL: [number, number, number, number] = [4, 4, 0, 0]

export interface Ponto {
  id: string
  rotulo: string
  [serie: string]: string | number
}

export interface Serie {
  chave: string
  nome: string
  cor: string
  pilha?: string
}

interface Props {
  dados: Ponto[]
  series: Serie[]
  /** Barras horizontais (categorias no eixo Y) — bom para rankings. */
  horizontal?: boolean
  formatarValor?: (v: number) => string
  formatarEixo?: (v: number) => string
  selecionado?: string
  onSelecionar?: (id: string) => void
  /** Cor por item (sobrepõe a cor da série única). */
  corItem?: (p: Ponto) => string
  larguraRotulo?: number
  legenda?: boolean
}

export function BarChartWidget({
  dados,
  series,
  horizontal,
  formatarValor = (v) => String(v),
  formatarEixo,
  selecionado,
  onSelecionar,
  corItem,
  larguraRotulo = 140,
  legenda = series.length > 1,
}: Props) {
  const fmtEixo = formatarEixo ?? formatarValor
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 4, right: 12, bottom: 0, left: horizontal ? 4 : -4 }}
        barCategoryGap={horizontal ? 6 : '22%'}
      >
        <CartesianGrid stroke={cores.grade} vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...eixoProps} tickFormatter={(v: number) => fmtEixo(v)} />
            <YAxis type="category" dataKey="rotulo" width={larguraRotulo} {...eixoProps} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey="rotulo" {...eixoProps} interval={0} />
            <YAxis {...eixoProps} width={64} tickFormatter={(v: number) => fmtEixo(v)} />
          </>
        )}
        <Tooltip {...tooltipProps} formatter={(v) => formatarValor(Number(v))} />
        {legenda && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
        {series.map((s, si) => (
          <Bar
            key={s.chave}
            dataKey={s.chave}
            name={s.nome}
            fill={s.cor}
            stackId={s.pilha}
            maxBarSize={horizontal ? 18 : 36}
            radius={s.pilha && si < series.length - 1 ? 0 : horizontal ? RAIO_HORIZONTAL : RAIO_VERTICAL}
          >
            {dados.map((p) => (
              <Cell
                key={p.id}
                fill={corItem && series.length === 1 ? corItem(p) : s.cor}
                fillOpacity={opacidade(selecionado, p.id)}
                style={{ cursor: onSelecionar ? 'pointer' : 'default' }}
                onClick={() => onSelecionar?.(p.id)}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
