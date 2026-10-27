import { describe, expect, it } from 'vitest'
import { gerarDatasetFicticio, mesesHistorico } from '../mocks/fixtures'
import { aplicarFiltros, mesesDoPeriodo, type Filtros } from './filters'
import { acuracidadePrevisao, coberturaDias, giroEstoque, ordensProducao, valorEstoque } from './indicators'
import type { FatoMensal } from './types'

const fato = (p: Partial<FatoMensal>): FatoMensal => ({
  mes: '2026-01',
  produto: 'X',
  familia: 'MON',
  valorEstoque: 0,
  qtdEstoque: 0,
  consumoValor: 0,
  opPlanejadas: 0,
  opRealizadas: 0,
  previsaoVendas: 0,
  vendasReais: 0,
  pcEmitidos: 0,
  pcAtraso: 0,
  pedidosExpedir: 0,
  pedidosExpedidos: 0,
  pedidosNoPrazo: 0,
  capacidadeHoras: 0,
  horasUtilizadas: 0,
  ...p,
})

describe('indicadores', () => {
  const fatos = [
    fato({ mes: '2026-01', valorEstoque: 600, consumoValor: 300, opPlanejadas: 10, opRealizadas: 9, previsaoVendas: 110, vendasReais: 100 }),
    fato({ mes: '2026-02', valorEstoque: 600, consumoValor: 300, opPlanejadas: 10, opRealizadas: 8, previsaoVendas: 90, vendasReais: 100 }),
  ]

  it('usa a posição do último mês para o valor do estoque', () => {
    expect(valorEstoque(fatos)).toBe(600)
  })

  it('calcula cobertura em dias e giro anualizado', () => {
    expect(coberturaDias(fatos)).toBeCloseTo(60)
    expect(giroEstoque(fatos)).toBeCloseTo(6)
  })

  it('calcula aderência e acuracidade (WMAPE)', () => {
    expect(ordensProducao(fatos).aderencia).toBeCloseTo(0.85)
    expect(acuracidadePrevisao(fatos)).toBeCloseTo(0.9)
  })
})

describe('filtros', () => {
  const ds = gerarDatasetFicticio()
  const filtros: Filtros = { periodo: '3m', familia: 'VEN', produto: 'todos' }

  it('aplica período, família e seleção cruzada', () => {
    const meses = mesesDoPeriodo(mesesHistorico, '3m')
    expect(meses).toHaveLength(3)
    const r = aplicarFiltros(ds.fatos, filtros, meses, { mes: meses[0] }, { campoData: 'mes' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((f) => f.familia === 'VEN' && f.mes === meses[0])).toBe(true)
  })

  it('não filtra o gráfico pela própria dimensão selecionada', () => {
    const meses = mesesDoPeriodo(mesesHistorico, '12m')
    const r = aplicarFiltros(ds.fatos, filtros, meses, { mes: meses[0] }, { campoData: 'mes', ignorar: 'mes' })
    expect(new Set(r.map((f) => f.mes)).size).toBe(12)
  })
})
