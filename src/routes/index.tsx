import { createFileRoute } from '@tanstack/react-router'
import { PaginaProtegida } from '@/components/ui/PaginaProtegida'
import { VisaoGeral } from '@/pages/VisaoGeral'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Visão Geral · Indicadores PCP' }] }),
  component: () => <PaginaProtegida permissao="visao-geral:ler">{(d) => <VisaoGeral dataset={d} />}</PaginaProtegida>,
})
