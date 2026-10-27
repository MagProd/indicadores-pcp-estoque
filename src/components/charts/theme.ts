import type { FamiliaId } from '@/domain/types'

/** Paleta dos gráficos — derivada do azul institucional. */
export const cores = {
  primaria: '#0b55a3',
  primariaClara: '#8db8e6',
  teal: '#0f8f86',
  ambar: '#d48806',
  vermelho: '#d14343',
  violeta: '#6d55c4',
  cinza: '#a3afbf',
  grade: '#edf0f4',
  eixo: '#64748b',
}

export const coresFamilia: Record<FamiliaId, string> = {
  MON: '#0b55a3',
  INF: '#3d8fd6',
  VEN: '#0f8f86',
  DEF: '#6d55c4',
  OXI: '#d48806',
  ECG: '#7d8ba1',
}

export const eixoProps = {
  tick: { fill: cores.eixo, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const

export const tooltipProps = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    boxShadow: '0 6px 20px rgb(15 35 70 / 0.10)',
    fontSize: 12,
    padding: '8px 12px',
  },
  labelStyle: { fontWeight: 600, color: '#0f172a', marginBottom: 4 },
  cursor: { fill: 'rgb(11 85 163 / 0.06)' },
} as const

/** Opacidade de itens não selecionados quando há filtro cruzado ativo. */
export const opacidade = (selecionado: string | undefined, id: string) => (selecionado && selecionado !== id ? 0.28 : 1)
