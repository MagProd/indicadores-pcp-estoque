import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { mesesDoPeriodo, type Dimensao, type Filtros, type Selecao } from '@/domain/filters'
import { useDataset } from './DataContext'

interface FiltersState {
  filtros: Filtros
  setFiltros: (patch: Partial<Filtros>) => void
  /** Meses do período selecionado (AAAA-MM). */
  meses: string[]
  selecao: Selecao
  /** Alterna a seleção cruzada de uma dimensão (clicar de novo remove). */
  alternarSelecao: (dim: Dimensao, valor: string | undefined) => void
  limparSelecao: (dim?: Dimensao) => void
}

const FiltersContext = createContext<FiltersState | null>(null)

const filtrosIniciais: Filtros = { periodo: '12m', familia: 'todas', produto: 'todos' }

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const { dataset } = useDataset()
  const [filtros, setFiltrosState] = useState<Filtros>(filtrosIniciais)
  const [selecao, setSelecao] = useState<Selecao>({})
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Seleções cruzadas valem por página; filtros globais persistem na navegação.
  useEffect(() => setSelecao({}), [pathname])

  const todosMeses = useMemo(
    () => [...new Set(dataset?.fatos.map((f) => f.mes) ?? [])].sort(),
    [dataset],
  )

  const setFiltros = useCallback((patch: Partial<Filtros>) => {
    setFiltrosState((f) => {
      const next = { ...f, ...patch }
      if (patch.familia && patch.familia !== f.familia) next.produto = 'todos'
      return next
    })
    setSelecao({})
  }, [])

  const alternarSelecao = useCallback((dim: Dimensao, valor: string | undefined) => {
    setSelecao((s) => ({ ...s, [dim]: valor === undefined || s[dim] === valor ? undefined : valor }))
  }, [])

  const limparSelecao = useCallback((dim?: Dimensao) => {
    setSelecao((s) => (dim ? { ...s, [dim]: undefined } : {}))
  }, [])

  const value = useMemo(
    () => ({
      filtros,
      setFiltros,
      meses: mesesDoPeriodo(todosMeses, filtros.periodo),
      selecao,
      alternarSelecao,
      limparSelecao,
    }),
    [filtros, setFiltros, todosMeses, selecao, alternarSelecao, limparSelecao],
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters deve ser usado dentro de FiltersProvider')
  return ctx
}
