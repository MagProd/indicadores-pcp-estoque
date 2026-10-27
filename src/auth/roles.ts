/**
 * Perfis de acesso. Em produção, devem corresponder aos App Roles definidos no
 * App Registration do Microsoft Entra ID (claim "roles" do token).
 * A autorização definitiva SEMPRE é validada também na API corporativa.
 */
export type Perfil = 'Administrador' | 'Diretoria' | 'PCP' | 'Compras' | 'Logistica' | 'Consulta'

export const perfis: { id: Perfil; descricao: string }[] = [
  { id: 'Administrador', descricao: 'Acesso total, incluindo configurações' },
  { id: 'Diretoria', descricao: 'Todas as páginas, somente leitura' },
  { id: 'PCP', descricao: 'Planejamento, estoques e S&OP' },
  { id: 'Compras', descricao: 'Compras e estoques' },
  { id: 'Logistica', descricao: 'Expedição e estoques' },
  { id: 'Consulta', descricao: 'Somente visão geral' },
]

export type Permissao =
  | 'visao-geral:ler'
  | 'planejamento:ler'
  | 'estoques:ler'
  | 'compras:ler'
  | 'sop:ler'
  | 'expedicao:ler'
  | 'dados:exportar'

const todas: Permissao[] = [
  'visao-geral:ler',
  'planejamento:ler',
  'estoques:ler',
  'compras:ler',
  'sop:ler',
  'expedicao:ler',
  'dados:exportar',
]

export const permissoesPorPerfil: Record<Perfil, Permissao[]> = {
  Administrador: todas,
  Diretoria: todas,
  PCP: ['visao-geral:ler', 'planejamento:ler', 'estoques:ler', 'sop:ler', 'dados:exportar'],
  Compras: ['visao-geral:ler', 'estoques:ler', 'compras:ler', 'dados:exportar'],
  Logistica: ['visao-geral:ler', 'estoques:ler', 'expedicao:ler'],
  Consulta: ['visao-geral:ler'],
}

export function temPermissao(perfisUsuario: Perfil[], permissao: Permissao) {
  return perfisUsuario.some((p) => permissoesPorPerfil[p]?.includes(permissao))
}
