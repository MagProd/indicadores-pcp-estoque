import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { Estoques } from '@/pages/Estoques'

export const Route = createFileRoute('/estoques')({
  head: () => ({ meta: [{ title: 'Estoques · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="estoques:ler">{(d) => <Estoques dataset={d} />}</PaginaProtegida>,
})
