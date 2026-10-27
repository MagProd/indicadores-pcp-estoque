import type { FatoMensal } from './types'

/**
 * Cálculo dos indicadores a partir dos fatos mensais filtrados.
 * Funções puras: podem ser reaproveitadas no backend quando a API existir.
 */

const soma = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0)

export function agruparPor<T, K extends string>(rows: T[], chave: (r: T) => K) {
  const mapa = new Map<K, T[]>()
  for (const r of rows) {
    const k = chave(r)
    const lista = mapa.get(k)
    if (lista) lista.push(r)
    else mapa.set(k, [r])
  }
  return mapa
}

export function mesesPresentes(fatos: FatoMensal[]) {
  return [...new Set(fatos.map((f) => f.mes))].sort()
}

/** Valor de estoque na posição do último mês do recorte. */
export function valorEstoque(fatos: FatoMensal[]) {
  const ultimo = mesesPresentes(fatos).at(-1)
  return soma(fatos.filter((f) => f.mes === ultimo), (f) => f.valorEstoque)
}

/** Cobertura em dias = estoque final ÷ consumo médio diário do período. */
export function coberturaDias(fatos: FatoMensal[]) {
  const meses = mesesPresentes(fatos).length
  if (!meses) return 0
  const consumoDia = soma(fatos, (f) => f.consumoValor) / (meses * 30)
  return consumoDia ? valorEstoque(fatos) / consumoDia : 0
}

/** Giro anualizado = consumo anualizado ÷ estoque médio. */
export function giroEstoque(fatos: FatoMensal[]) {
  const meses = mesesPresentes(fatos).length
  if (!meses) return 0
  const estoqueMedio = soma(fatos, (f) => f.valorEstoque) / meses
  const consumoAnual = (soma(fatos, (f) => f.consumoValor) / meses) * 12
  return estoqueMedio ? consumoAnual / estoqueMedio : 0
}

export function ordensProducao(fatos: FatoMensal[]) {
  const planejadas = soma(fatos, (f) => f.opPlanejadas)
  const realizadas = soma(fatos, (f) => f.opRealizadas)
  return { planejadas, realizadas, aderencia: planejadas ? realizadas / planejadas : 0 }
}

/** Acuracidade = 1 − Σ|previsto − real| ÷ Σ real (WMAPE). */
export function acuracidadePrevisao(fatos: FatoMensal[]) {
  const real = soma(fatos, (f) => f.vendasReais)
  if (!real) return 0
  return Math.max(0, 1 - soma(fatos, (f) => Math.abs(f.previsaoVendas - f.vendasReais)) / real)
}

/** Viés = Σ(previsto − real) ÷ Σ real. Positivo = superestimado. */
export function viesPrevisao(fatos: FatoMensal[]) {
  const real = soma(fatos, (f) => f.vendasReais)
  return real ? soma(fatos, (f) => f.previsaoVendas - f.vendasReais) / real : 0
}

export function pedidosCompra(fatos: FatoMensal[]) {
  const emitidos = soma(fatos, (f) => f.pcEmitidos)
  const atraso = soma(fatos, (f) => f.pcAtraso)
  return { emitidos, atraso, pctAtraso: emitidos ? atraso / emitidos : 0 }
}

export function expedicao(fatos: FatoMensal[]) {
  const aExpedir = soma(fatos, (f) => f.pedidosExpedir)
  const expedidos = soma(fatos, (f) => f.pedidosExpedidos)
  const noPrazo = soma(fatos, (f) => f.pedidosNoPrazo)
  return {
    aExpedir,
    expedidos,
    noPrazo,
    atendimento: aExpedir ? expedidos / aExpedir : 0,
    otd: expedidos ? noPrazo / expedidos : 0,
  }
}

export function utilizacaoCapacidade(fatos: FatoMensal[]) {
  const cap = soma(fatos, (f) => f.capacidadeHoras)
  return cap ? soma(fatos, (f) => f.horasUtilizadas) / cap : 0
}

/** Série mensal genérica: aplica um cálculo a cada mês do recorte. */
export function serieMensal<R>(fatos: FatoMensal[], calc: (doMes: FatoMensal[]) => R) {
  const grupos = agruparPor(fatos, (f) => f.mes)
  return [...grupos.keys()].sort().map((mes) => ({ mes, ...calc(grupos.get(mes)!) }))
}

/** Variação percentual entre a 2ª metade e a 1ª metade do recorte. */
export function tendencia(fatos: FatoMensal[], calc: (f: FatoMensal[]) => number) {
  const meses = mesesPresentes(fatos)
  if (meses.length < 2) return undefined
  const meio = Math.floor(meses.length / 2)
  const a = calc(fatos.filter((f) => meses.indexOf(f.mes) < meio))
  const b = calc(fatos.filter((f) => meses.indexOf(f.mes) >= meio))
  return a ? (b - a) / a : undefined
}
