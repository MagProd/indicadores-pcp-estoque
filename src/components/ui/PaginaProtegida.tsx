import { AlertTriangle, Lock, RefreshCw } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import type { Permissao } from '@/auth/roles'
import type { DashboardDataset } from '@/domain/types'
import { useDataset } from '@/state/DataContext'
import { Card } from './Card'
import { SelectionChips } from './SelectionChips'

function Esqueleto() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando indicadores">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-white shadow-card" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-card xl:col-span-2" />
        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    </div>
  )
}

/**
 * Envolve cada página: verifica permissão do perfil, estados de carregamento
 * e erro, e entrega o dataset pronto para a página renderizar.
 */
export function PaginaProtegida({
  permissao,
  children,
}: {
  permissao: Permissao
  children: (dataset: DashboardDataset) => React.ReactNode
}) {
  const { pode, carregando: carregandoAuth, usuario } = useAuth()
  const { dataset, erro, carregando, recarregar } = useDataset()

  if (carregandoAuth || (carregando && !dataset)) return <Esqueleto />

  if (!usuario || !pode(permissao))
    return (
      <Card className="mx-auto mt-10 max-w-lg p-10 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Lock className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Acesso restrito</h2>
        <p className="mt-1 text-sm text-slate-500">
          Seu perfil ({usuario?.perfis.join(', ') ?? 'não autenticado'}) não possui permissão para esta página. Solicite acesso ao
          administrador do sistema.
        </p>
      </Card>
    )

  if (erro || !dataset)
    return (
      <Card className="mx-auto mt-10 max-w-lg p-10 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Não foi possível carregar os dados</h2>
        <p className="mt-1 text-sm text-slate-500">{erro}</p>
        <button
          onClick={recarregar}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <RefreshCw className="size-4" /> Tentar novamente
        </button>
      </Card>
    )

  return (
    <div className="space-y-5">
      <div className="flex min-h-7 items-center">
        <SelectionChips />
      </div>
      {children(dataset)}
    </div>
  )
}
