import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { Planejamento } from '@/pages/Planejamento'

export const Route = createFileRoute('/planejamento')({
  head: () => ({ meta: [{ title: 'Planejamento de Produção · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="planejamento:ler">{(d) => <Planejamento dataset={d} />}</PaginaProtegida>,
})
