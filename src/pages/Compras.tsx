import { AlarmClock, Banknote, FileText, Percent, Timer } from 'lucide-react'
import { BarChartWidget, type Ponto } from '@/components/charts/BarChartWidget'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores, coresFamilia } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { DataTable, type Coluna } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { agregar, contar, somar } from '@/domain/aggregate'
import type { Dimensao } from '@/domain/filters'
import { fmt } from '@/domain/format'
import { agruparPor } from '@/domain/indicators'
import type { DashboardDataset, FamiliaId, PedidoCompra, StatusPC } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

const statusPC: StatusPC[] = ['Recebido', 'No prazo', 'Parcial', 'Em atraso']
const corStatus: Record<StatusPC, string> = {
  Recebido: cores.teal,
  'No prazo': cores.primaria,
  Parcial: cores.ambar,
  'Em atraso': cores.vermelho,
}

export function Compras({ dataset }: { dataset: DashboardDataset }) {
  const { filtrar, selecao, alternar, nomeFamilia } = useRecorte(dataset)
  const pcs = (ignorar?: Dimensao) => filtrar<PedidoCompra>(dataset.pedidosCompra, { campoData: 'emissao', ignorar })

  const lista = pcs()
  const atrasados = lista.filter((p) => p.status === 'Em atraso')
  const valorTotal = somar(lista, (p) => p.valor)

  const mensal = [...agruparPor(pcs('mes'), (p) => p.emissao.slice(0, 7)).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, g]): Ponto => ({
      id: mes,
      rotulo: fmt.mes(mes),
      ...Object.fromEntries(statusPC.map((s) => [s, contar(g, (p) => p.status === s)])),
      pctAtraso: g.length ? contar(g, (p) => p.status === 'Em atraso') / g.length : 0,
    }))

  const porFornecedor = agregar(pcs('fornecedor'), (p) => p.fornecedor, (g) => ({
    rotulo: g[0].fornecedor,
    atraso: contar(g, (p) => p.status === 'Em atraso'),
    total: g.length,
  })).sort((a, b) => b.atraso - a.atraso)

  const porStatus = statusPC.map((s) => ({
    id: s,
    rotulo: s,
    valor: somar(
      pcs('status').filter((p) => p.status === s),
      (p) => p.valor,
    ),
    cor: corStatus[s],
  }))

  const porFamilia = agregar(pcs('familia'), (p) => p.familia, (g, id) => ({
    rotulo: id,
    nome: nomeFamilia(id),
    valor: somar(g, (p) => p.valor),
  })).sort((a, b) => b.valor - a.valor)

  const colunas: Coluna<PedidoCompra>[] = [
    { chave: 'numero', titulo: 'Pedido', valor: (p) => p.numero, render: (p) => <span className="font-medium text-slate-900">{p.numero}</span> },
    { chave: 'fornecedor', titulo: 'Fornecedor', valor: (p) => p.fornecedor },
    { chave: 'material', titulo: 'Material', valor: (p) => p.material },
    { chave: 'produto', titulo: 'Produto', valor: (p) => p.produto },
    { chave: 'emissao', titulo: 'Emissão', valor: (p) => p.emissao, render: (p) => fmt.data(p.emissao) },
    { chave: 'entrega', titulo: 'Entrega prevista', valor: (p) => p.entregaPrevista, render: (p) => fmt.data(p.entregaPrevista) },
    { chave: 'valor', titulo: 'Valor', valor: (p) => p.valor, render: (p) => fmt.moeda(p.valor), alinhar: 'right' },
    {
      chave: 'atraso',
      titulo: 'Dias de atraso',
      valor: (p) => p.diasAtraso,
      alinhar: 'right',
      render: (p) => <span className={p.diasAtraso > 15 ? 'font-semibold text-rose-600' : ''}>{p.diasAtraso || '—'}</span>,
    },
    { chave: 'status', titulo: 'Status', valor: (p) => p.status, render: (p) => <StatusBadge status={p.status} /> },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard titulo="Pedidos de compra emitidos" valor={fmt.numero(lista.length)} icone={FileText} detalhe="no período" />
        <KpiCard titulo="Valor comprado" valor={fmt.moedaCompacta(valorTotal)} icone={Banknote} tom="teal" detalhe="soma dos pedidos" />
        <KpiCard titulo="Pedidos em atraso" valor={fmt.numero(atrasados.length)} icone={AlarmClock} tom="rose" detalhe={fmt.moedaCompacta(somar(atrasados, (p) => p.valor))} />
        <KpiCard
          titulo="Percentual em atraso"
          valor={fmt.pct(lista.length ? atrasados.length / lista.length : 0)}
          icone={Percent}
          tom="amber"
          progresso={{ valor: lista.length ? atrasados.length / lista.length : 0, meta: 0.1 }}
          detalhe="meta máx. 10%"
        />
        <KpiCard
          titulo="Atraso médio"
          valor={fmt.dias(atrasados.length ? somar(atrasados, (p) => p.diasAtraso) / atrasados.length : 0)}
          icone={Timer}
          tom="violet"
          detalhe="pedidos em atraso"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Pedidos de compra por mês" subtitulo="Quantidade por status e % em atraso · clique em um mês" interativo className="xl:col-span-3">
          <TrendChart
            dados={mensal}
            series={[
              ...statusPC.map((s) => ({ chave: s, nome: s, cor: corStatus[s], tipo: 'barra' as const, pilha: 'st' })),
              { chave: 'pctAtraso', nome: '% em atraso', cor: cores.vermelho, tipo: 'linha' as const, eixoDireito: true, tracejada: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={fmt.pct}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
        <ChartCard titulo="Valor por status" subtitulo="Distribuição financeira da carteira" interativo className="xl:col-span-2">
          <DonutChart
            dados={porStatus}
            formatarValor={fmt.moedaCompacta}
            centro={{ valor: fmt.moedaCompacta(somar(porStatus, (s) => s.valor)), rotulo: 'carteira' }}
            selecionado={selecao.status}
            onSelecionar={(id) => alternar('status', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Pedidos em atraso por fornecedor" subtitulo="Ranking de fornecedores" interativo className="xl:col-span-3">
          <BarChartWidget
            horizontal
            larguraRotulo={180}
            dados={porFornecedor}
            series={[{ chave: 'atraso', nome: 'Em atraso', cor: cores.vermelho }]}
            formatarValor={fmt.numero}
            selecionado={selecao.fornecedor}
            onSelecionar={(id) => alternar('fornecedor', id)}
          />
        </ChartCard>
        <ChartCard titulo="Valor comprado por família" interativo className="xl:col-span-2">
          <BarChartWidget
            dados={porFamilia}
            series={[{ chave: 'valor', nome: 'Valor', cor: cores.primaria }]}
            corItem={(p) => coresFamilia[p.id as FamiliaId]}
            formatarValor={fmt.moedaCompacta}
            selecionado={selecao.familia}
            onSelecionar={(id) => alternar('familia', id)}
          />
        </ChartCard>
      </div>

      <DataTable
        titulo="Pedidos de compra"
        subtitulo="Ordenados pelos maiores atrasos"
        colunas={colunas}
        linhas={lista}
        chaveLinha={(p) => p.numero}
        ordenacaoInicial={{ chave: 'atraso', desc: true }}
      />
    </>
  )
}
