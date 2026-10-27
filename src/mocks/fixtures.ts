import type {
  DashboardDataset,
  Expedicao,
  FatoMensal,
  OrdemProducao,
  PedidoCompra,
  PosicaoEstoque,
  StatusExpedicao,
  StatusOP,
} from '@/domain/types'
import {
  clientes,
  depositos,
  familias,
  fornecedores,
  linhasProducao,
  materiais,
  produtos,
  regioes,
  transportadoras,
} from './catalog'

/**
 * Gerador determinístico de dados FICTÍCIOS para validação de layout.
 * Usa um PRNG com semente fixa para que os números sejam estáveis entre
 * recarregamentos (e entre servidor e navegador).
 */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261026)
const between = (min: number, max: number) => min + rand() * (max - min)
const int = (min: number, max: number) => Math.round(between(min, max))
const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]

/** Mês de referência fixo dos dados fictícios. */
const REF_ANO = 2026
const REF_MES = 10

function mesOffset(offset: number) {
  const d = new Date(Date.UTC(REF_ANO, REF_MES - 1 + offset, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function dataNoMes(mes: string, dia: number) {
  return `${mes}-${String(Math.min(dia, 28)).padStart(2, '0')}`
}

export const mesesHistorico = Array.from({ length: 12 }, (_, i) => mesOffset(i - 11))
export const mesesProjecao = Array.from({ length: 6 }, (_, i) => mesOffset(i + 1))

function gerarFatos(): FatoMensal[] {
  const fatos: FatoMensal[] = []
  for (const p of produtos) {
    const demandaBase = Math.min(2600, Math.max(6, 260000 / p.custoUnitario))
    const viesFamilia = { MON: 1.02, INF: 0.97, VEN: 1.08, DEF: 0.99, OXI: 1.04, ECG: 0.95 }[p.familia]
    let estoqueQtd = demandaBase * between(1.2, 2.4)
    mesesHistorico.forEach((mes, idx) => {
      const sazonal = 1 + 0.12 * Math.sin((idx / 12) * Math.PI * 2 + 0.8)
      const tendencia = 1 + idx * 0.012
      const vendas = Math.max(1, Math.round(demandaBase * sazonal * tendencia * between(0.82, 1.18)))
      const previsao = Math.max(1, Math.round(vendas * viesFamilia * between(0.86, 1.14)))
      const opPlan = Math.max(1, Math.round(between(2, 9) * (p.custoUnitario > 5000 ? 1 : 2.2)))
      const opReal = Math.min(opPlan, Math.round(opPlan * between(0.78, 1.0)))
      estoqueQtd = Math.max(demandaBase * 0.4, estoqueQtd + vendas * between(0.85, 1.15) - vendas)
      const pcEmitidos = int(3, 14)
      const pedidos = Math.max(2, Math.round(vendas / Math.max(1, demandaBase / 40)))
      const expedidos = Math.round(pedidos * between(0.88, 1))
      const capacidade = Math.round(between(260, 420))
      fatos.push({
        mes,
        produto: p.codigo,
        familia: p.familia,
        qtdEstoque: Math.round(estoqueQtd),
        valorEstoque: Math.round(estoqueQtd * p.custoUnitario),
        consumoValor: Math.round(vendas * p.custoUnitario),
        vendasReais: vendas,
        previsaoVendas: previsao,
        opPlanejadas: opPlan,
        opRealizadas: opReal,
        pcEmitidos,
        pcAtraso: Math.round(pcEmitidos * between(0, 0.32)),
        pedidosExpedir: pedidos,
        pedidosExpedidos: expedidos,
        pedidosNoPrazo: Math.round(expedidos * between(0.84, 0.99)),
        capacidadeHoras: capacidade,
        horasUtilizadas: Math.round(capacidade * between(0.68, 0.97)),
      })
    })
  }
  return fatos
}

function gerarOrdens(): OrdemProducao[] {
  const statusPorIdade: StatusOP[] = ['Concluída', 'Concluída', 'Concluída', 'Atrasada', 'Em produção', 'Liberada', 'Planejada']
  return Array.from({ length: 96 }, (_, i) => {
    const p = pick(produtos)
    const mes = mesesHistorico[Math.min(11, 6 + Math.floor(i / 16))]
    const status = i >= 80 ? pick(statusPorIdade.slice(3)) : pick(statusPorIdade)
    const qtd = Math.max(5, Math.round(Math.min(800, 90000 / p.custoUnitario) * between(0.6, 1.4)))
    const inicio = int(1, 18)
    return {
      numero: `OP-${String(26000 + i * 7).padStart(6, '0')}`,
      produto: p.codigo,
      familia: p.familia,
      linha: p.custoUnitario < 1000 ? linhasProducao[3] : p.familia === 'VEN' ? linhasProducao[2] : pick(linhasProducao.slice(0, 2)),
      quantidade: qtd,
      quantidadeProduzida:
        status === 'Concluída' ? qtd : status === 'Planejada' || status === 'Liberada' ? 0 : Math.round(qtd * between(0.2, 0.85)),
      inicioPlanejado: dataNoMes(mes, inicio),
      fimPlanejado: dataNoMes(mes, inicio + int(4, 10)),
      status,
    }
  })
}

function gerarPedidosCompra(): PedidoCompra[] {
  return Array.from({ length: 120 }, (_, i) => {
    const p = pick(produtos)
    const mes = mesesHistorico[Math.floor(rand() * 12)]
    const r = rand()
    const status = r < 0.22 ? 'Em atraso' : r < 0.32 ? 'Parcial' : r < 0.72 ? 'Recebido' : 'No prazo'
    return {
      numero: `PC-${String(48000 + i * 3).padStart(6, '0')}`,
      fornecedor: pick(fornecedores),
      material: pick(materiais),
      familia: p.familia,
      produto: p.codigo,
      valor: Math.round(between(4000, 220000)),
      emissao: dataNoMes(mes, int(1, 10)),
      entregaPrevista: dataNoMes(mes, int(15, 28)),
      diasAtraso: status === 'Em atraso' ? int(2, 45) : status === 'Parcial' ? int(0, 12) : 0,
      status,
    }
  })
}

function gerarExpedicoes(): Expedicao[] {
  const statuses: StatusExpedicao[] = ['Expedido', 'Expedido', 'Expedido', 'Expedido', 'Em separação', 'Aguardando NF', 'Atrasado']
  return Array.from({ length: 140 }, (_, i) => {
    const p = pick(produtos)
    const mes = mesesHistorico[Math.floor(rand() * 12)]
    const status = pick(statuses)
    return {
      pedido: `PV-${String(71000 + i * 5).padStart(6, '0')}`,
      cliente: pick(clientes),
      regiao: pick(regioes),
      transportadora: pick(transportadoras),
      produto: p.codigo,
      familia: p.familia,
      quantidade: Math.max(1, Math.round(Math.min(300, 40000 / p.custoUnitario) * between(0.3, 1.5))),
      dataPrevista: dataNoMes(mes, int(1, 28)),
      status,
      noPrazo: status !== 'Atrasado' && rand() > 0.07,
    }
  })
}

function gerarPosicoes(fatos: FatoMensal[]): PosicaoEstoque[] {
  const ultimoMes = mesesHistorico[mesesHistorico.length - 1]
  return fatos
    .filter((f) => f.mes === ultimoMes)
    .flatMap((f) => {
      const p = produtos.find((x) => x.codigo === f.produto)!
      const pesos = [0.55, 0.3, 0.15].map((w) => w * between(0.7, 1.3))
      const soma = pesos.reduce((a, b) => a + b, 0)
      return depositos.map((deposito, i) => {
        const quantidade = Math.round((f.qtdEstoque * pesos[i]) / soma)
        const demandaDia = f.vendasReais / 30
        return {
          produto: f.produto,
          familia: f.familia,
          deposito,
          quantidade,
          valor: Math.round(quantidade * p.custoUnitario),
          estoqueSeguranca: Math.round(demandaDia * 12 * pesos[i]),
          coberturaDias: demandaDia > 0 ? Math.round(quantidade / ((demandaDia * pesos[i]) / soma)) : 0,
        }
      })
    })
}

function gerarProjecaoSOP(fatos: FatoMensal[]): DashboardDataset['projecaoSOP'] {
  return familias.flatMap((f) => {
    const ultimo = fatos
      .filter((x) => x.familia === f.id && x.mes === mesesHistorico[11])
      .reduce((s, x) => s + x.vendasReais, 0)
    return mesesProjecao.map((mes, i) => {
      const demanda = Math.round(ultimo * (1 + 0.02 * i) * between(0.92, 1.12))
      const capacidade = Math.round(ultimo * between(1.02, 1.18))
      return { mes, familia: f.id, demanda, oferta: Math.min(capacidade, Math.round(demanda * between(0.9, 1.06))), capacidade }
    })
  })
}

let cache: DashboardDataset | null = null

export function gerarDatasetFicticio(): DashboardDataset {
  if (cache) return cache
  const fatos = gerarFatos()
  cache = {
    familias,
    produtos,
    fatos,
    ordens: gerarOrdens(),
    pedidosCompra: gerarPedidosCompra(),
    expedicoes: gerarExpedicoes(),
    posicoes: gerarPosicoes(fatos),
    projecaoSOP: gerarProjecaoSOP(fatos),
    atualizadoEm: '2026-10-26T07:30:00-03:00',
    origem: 'Dados fictícios (demonstração)',
  }
  return cache
}
