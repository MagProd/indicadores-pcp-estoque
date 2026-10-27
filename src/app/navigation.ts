import { Boxes, CalendarRange, Factory, LayoutDashboard, ShoppingCart, Truck, type LucideIcon } from 'lucide-react'
import type { Permissao } from '@/auth/roles'

export interface PaginaConfig {
  path: '/' | '/planejamento' | '/estoques' | '/compras' | '/sop' | '/expedicao'
  titulo: string
  subtitulo: string
  icone: LucideIcon
  permissao: Permissao
}

/**
 * Registro central das páginas. Para adicionar uma nova página:
 *  1. crie o componente em src/pages;
 *  2. crie a rota em src/routes usando <PaginaProtegida>;
 *  3. adicione a entrada aqui (menu, título e permissão).
 */
export const paginas: PaginaConfig[] = [
  {
    path: '/',
    titulo: 'Visão Geral',
    subtitulo: 'Indicadores consolidados de PCP, estoque e suprimentos',
    icone: LayoutDashboard,
    permissao: 'visao-geral:ler',
  },
  {
    path: '/planejamento',
    titulo: 'Planejamento de Produção',
    subtitulo: 'Ordens de produção, aderência ao plano e capacidade',
    icone: Factory,
    permissao: 'planejamento:ler',
  },
  {
    path: '/estoques',
    titulo: 'Estoques',
    subtitulo: 'Posição, cobertura, giro e classificação ABC',
    icone: Boxes,
    permissao: 'estoques:ler',
  },
  {
    path: '/compras',
    titulo: 'Compras',
    subtitulo: 'Pedidos de compra, atrasos e desempenho de fornecedores',
    icone: ShoppingCart,
    permissao: 'compras:ler',
  },
  {
    path: '/sop',
    titulo: 'S&OP',
    subtitulo: 'Demanda × oferta, acuracidade da previsão e horizonte de planejamento',
    icone: CalendarRange,
    permissao: 'sop:ler',
  },
  {
    path: '/expedicao',
    titulo: 'Expedição',
    subtitulo: 'Pedidos expedidos, pontualidade e transportadoras',
    icone: Truck,
    permissao: 'expedicao:ler',
  },
]

export function paginaPorPath(path: string) {
  return paginas.find((p) => p.path === path) ?? paginas[0]
}
