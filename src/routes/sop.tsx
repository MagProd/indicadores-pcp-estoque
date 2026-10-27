import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { SOP } from '@/pages/SOP'

export const Route = createFileRoute('/sop')({
  head: () => ({ meta: [{ title: 'S&OP · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="sop:ler">{(d) => <SOP dataset={d} />}</PaginaProtegida>,
})
