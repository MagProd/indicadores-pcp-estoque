import { useCallback } from 'react'
import { aplicarFiltros, type Dimensao, type OpcoesFiltro } from '@/domain/filters'
import type { DashboardDataset, FatoMensal } from '@/domain/types'
import { useFilters } from '@/state/FiltersContext'

/**
 * Acesso padronizado ao recorte de dados da página atual (filtros globais +
 * seleção cruzada). Use `fatos(dim)` para alimentar um gráfico agrupado por
 * `dim`: ele recebe todos os filtros exceto o próprio, e apenas destaca o item
 * selecionado em vez de desaparecer com os demais.
 */
export function useRecorte(dataset: DashboardDataset) {
  const { filtros, meses, selecao, alternarSelecao } = useFilters()

  const filtrar = useCallback(
    <T extends object>(rows: T[], opcoes?: OpcoesFiltro<T>) => aplicarFiltros(rows, filtros, meses, selecao, opcoes),
    [filtros, meses, selecao],
  )

  const fatos = useCallback(
    (ignorar?: Dimensao | Dimensao[]) =>
      filtrar<FatoMensal>(dataset.fatos, {
        campoData: 'mes',
        ignorar,
        resolver: { curvaABC: (f) => dataset.produtos.find((p) => p.codigo === f.produto)?.curvaABC },
      }),
    [filtrar, dataset],
  )

  const nomeFamilia = useCallback((id: string) => dataset.familias.find((f) => f.id === id)?.nome ?? id, [dataset])
  const produto = useCallback((codigo: string) => dataset.produtos.find((p) => p.codigo === codigo), [dataset])

  return { filtros, meses, selecao, alternar: alternarSelecao, filtrar, fatos, nomeFamilia, produto }
}
