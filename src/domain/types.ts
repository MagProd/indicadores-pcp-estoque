/**
 * Modelos de domínio compartilhados entre a camada de dados (services) e a
 * camada visual (components/pages). Ao integrar a API corporativa, os
 * contratos (DTOs) devem ser mapeados para estes tipos no serviço HTTP.
 */

export type FamiliaId = 'MON' | 'INF' | 'VEN' | 'DEF' | 'OXI' | 'ECG'

export interface Familia {
  id: FamiliaId
  nome: string
}

export interface Produto {
  codigo: string
  descricao: string
  familia: FamiliaId
  curvaABC: 'A' | 'B' | 'C'
  custoUnitario: number
}

/** Fato mensal por produto — grão base de todos os indicadores. */
export interface FatoMensal {
  /** Formato AAAA-MM */
  mes: string
  produto: string
  familia: FamiliaId
  valorEstoque: number
  qtdEstoque: number
  /** Custo do consumo/vendas no mês (base para giro e cobertura). */
  consumoValor: number
  opPlanejadas: number
  opRealizadas: number
  previsaoVendas: number
  vendasReais: number
  pcEmitidos: number
  pcAtraso: number
  pedidosExpedir: number
  pedidosExpedidos: number
  pedidosNoPrazo: number
  capacidadeHoras: number
  horasUtilizadas: number
}

export type StatusOP = 'Planejada' | 'Liberada' | 'Em produção' | 'Concluída' | 'Atrasada'

export interface OrdemProducao {
  numero: string
  produto: string
  familia: FamiliaId
  linha: string
  quantidade: number
  quantidadeProduzida: number
  inicioPlanejado: string
  fimPlanejado: string
  status: StatusOP
}

export type StatusPC = 'No prazo' | 'Em atraso' | 'Recebido' | 'Parcial'

export interface PedidoCompra {
  numero: string
  fornecedor: string
  material: string
  familia: FamiliaId
  produto: string
  valor: number
  emissao: string
  entregaPrevista: string
  diasAtraso: number
  status: StatusPC
}

export type StatusExpedicao = 'Expedido' | 'Em separação' | 'Aguardando NF' | 'Atrasado'

export interface Expedicao {
  pedido: string
  cliente: string
  regiao: string
  transportadora: string
  produto: string
  familia: FamiliaId
  quantidade: number
  dataPrevista: string
  status: StatusExpedicao
  noPrazo: boolean
}

export interface PosicaoEstoque {
  produto: string
  familia: FamiliaId
  deposito: string
  quantidade: number
  valor: number
  estoqueSeguranca: number
  coberturaDias: number
}

/** Pacote de dados entregue pela camada de serviços à camada visual. */
export interface DashboardDataset {
  familias: Familia[]
  produtos: Produto[]
  fatos: FatoMensal[]
  ordens: OrdemProducao[]
  pedidosCompra: PedidoCompra[]
  expedicoes: Expedicao[]
  posicoes: PosicaoEstoque[]
  /** Projeção de demanda/oferta para o horizonte S&OP (meses futuros). */
  projecaoSOP: { mes: string; familia: FamiliaId; demanda: number; oferta: number; capacidade: number }[]
  /** Data/hora ISO da última atualização na origem dos dados. */
  atualizadoEm: string
  /** Origem dos dados (ex.: "Dados fictícios", "ERP corporativo"). */
  origem: string
}
