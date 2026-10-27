import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { Compras } from '@/pages/Compras'

export const Route = createFileRoute('/compras')({
  head: () => ({ meta: [{ title: 'Compras · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="compras:ler">{(d) => <Compras dataset={d} />}</PaginaProtegida>,
})
