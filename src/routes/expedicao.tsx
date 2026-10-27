import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { Expedicao } from '@/pages/Expedicao'

export const Route = createFileRoute('/expedicao')({
  head: () => ({ meta: [{ title: 'Expedição · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="expedicao:ler">{(d) => <Expedicao dataset={d} />}</PaginaProtegida>,
})
