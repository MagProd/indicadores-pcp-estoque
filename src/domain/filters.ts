import type { FamiliaId } from './types'

export type Periodo = '3m' | '6m' | '12m' | 'ytd'

export const periodos: { id: Periodo; label: string }[] = [
  { id: '3m', label: 'Últimos 3 meses' },
  { id: '6m', label: 'Últimos 6 meses' },
  { id: '12m', label: 'Últimos 12 meses' },
  { id: 'ytd', label: 'Ano corrente' },
]

export interface Filtros {
  periodo: Periodo
  familia: FamiliaId | 'todas'
  produto: string | 'todos'
}

/** Dimensões disponíveis para filtros cruzados (clique em gráficos). */
export type Dimensao =
  | 'familia'
  | 'mes'
  | 'produto'
  | 'fornecedor'
  | 'linha'
  | 'deposito'
  | 'regiao'
  | 'transportadora'
  | 'status'
  | 'curvaABC'

export type Selecao = Partial<Record<Dimensao, string>>

export const rotulosDimensao: Record<Dimensao, string> = {
  familia: 'Família',
  mes: 'Mês',
  produto: 'Produto',
  fornecedor: 'Fornecedor',
  linha: 'Linha',
  deposito: 'Depósito',
  regiao: 'Região',
  transportadora: 'Transportadora',
  status: 'Status',
  curvaABC: 'Curva ABC',
}

export function mesesDoPeriodo(todosMeses: string[], periodo: Periodo): string[] {
  if (periodo === 'ytd') {
    const ano = todosMeses[todosMeses.length - 1]?.slice(0, 4)
    return todosMeses.filter((m) => m.startsWith(ano))
  }
  const n = periodo === '3m' ? 3 : periodo === '6m' ? 6 : 12
  return todosMeses.slice(-n)
}

export interface OpcoesFiltro<T> {
  /** Campo que contém data (AAAA-MM ou AAAA-MM-DD) usado no filtro de período. */
  campoData?: keyof T
  /** Seleção cruzada ignorada — o gráfico que originou a seleção não filtra a si mesmo. */
  ignorar?: Dimensao | Dimensao[]
  /** Resolve dimensões que não são campos diretos do registro (ex.: curvaABC). */
  resolver?: Partial<Record<Dimensao, (row: T) => string | undefined>>
}

/**
 * Aplica filtros globais (período, família, produto) e a seleção cruzada a
 * qualquer coleção de registros. Dimensões ausentes no registro são ignoradas,
 * o que permite reutilizar a mesma seleção entre entidades diferentes.
 */
export function aplicarFiltros<T extends object>(
  rows: T[],
  filtros: Filtros,
  meses: string[],
  selecao: Selecao,
  opcoes: OpcoesFiltro<T> = {},
): T[] {
  const ignorar = new Set(Array.isArray(opcoes.ignorar) ? opcoes.ignorar : opcoes.ignorar ? [opcoes.ignorar] : [])
  const mesesSet = new Set(meses)
  const valor = (row: T, dim: Dimensao): string | undefined => {
    if (opcoes.resolver?.[dim]) return opcoes.resolver[dim]!(row)
    if (dim === 'mes') return opcoes.campoData ? String(row[opcoes.campoData]).slice(0, 7) : undefined
    const v = (row as Record<string, unknown>)[dim]
    return v === undefined ? undefined : String(v)
  }
  const ativos = (Object.entries(selecao) as [Dimensao, string | undefined][]).filter(
    ([d, v]) => v !== undefined && !ignorar.has(d),
  )

  return rows.filter((row) => {
    if (filtros.familia !== 'todas' && valor(row, 'familia') !== undefined && valor(row, 'familia') !== filtros.familia)
      return false
    if (filtros.produto !== 'todos' && valor(row, 'produto') !== undefined && valor(row, 'produto') !== filtros.produto)
      return false
    if (opcoes.campoData && !mesesSet.has(String(row[opcoes.campoData]).slice(0, 7))) return false
    for (const [dim, v] of ativos) {
      const atual = valor(row, dim)
      if (atual !== undefined && atual !== v) return false
    }
    return true
  })
}
