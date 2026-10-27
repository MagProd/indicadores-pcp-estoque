import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { DashboardDataset } from '@/domain/types'
import { dataService } from '@/services/dataService'

interface DataState {
  dataset: DashboardDataset | null
  erro: string | null
  carregando: boolean
  recarregar: () => void
}

const DataContext = createContext<DataState | null>(null)

/** Carrega o dataset pela camada de serviços e o disponibiliza às páginas. */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    dataService
      .carregarDataset()
      .then(setDataset)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Falha ao carregar os dados.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(carregar, [carregar])

  return (
    <DataContext.Provider value={{ dataset, erro, carregando, recarregar: carregar }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataset() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataset deve ser usado dentro de DataProvider')
  return ctx
}
