import { Clock3, PackageCheck, PackageX, Send, Timer } from 'lucide-react'
import { BarChartWidget, type Ponto } from '@/components/charts/BarChartWidget'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { DataTable, type Coluna } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { agregar, contar, somar } from '@/domain/aggregate'
import type { Dimensao } from '@/domain/filters'
import { fmt } from '@/domain/format'
import { agruparPor } from '@/domain/indicators'
import type { DashboardDataset, Expedicao as ExpedicaoT, StatusExpedicao } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

const statusExp: StatusExpedicao[] = ['Expedido', 'Em separação', 'Aguardando NF', 'Atrasado']
const corStatus: Record<StatusExpedicao, string> = {
  Expedido: cores.teal,
  'Em separação': cores.primaria,
  'Aguardando NF': cores.ambar,
  Atrasado: cores.vermelho,
}
const coresRegiao = [cores.primaria, '#3d8fd6', cores.teal, cores.violeta, cores.ambar]

export function Expedicao({ dataset }: { dataset: DashboardDataset }) {
  const { filtrar, selecao, alternar } = useRecorte(dataset)
  const exps = (ignorar?: Dimensao) => filtrar<ExpedicaoT>(dataset.expedicoes, { campoData: 'dataPrevista', ignorar })

  const lista = exps()
  const expedidos = lista.filter((e) => e.status === 'Expedido')
  const otd = expedidos.length ? contar(expedidos, (e) => e.noPrazo) / expedidos.length : 0
  const backlog = lista.length - expedidos.length

  const mensal = [...agruparPor(exps('mes'), (e) => e.dataPrevista.slice(0, 7)).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, g]): Ponto => {
      const exp = g.filter((e) => e.status === 'Expedido')
      return {
        id: mes,
        rotulo: fmt.mes(mes),
        noPrazo: contar(exp, (e) => e.noPrazo),
        foraPrazo: contar(exp, (e) => !e.noPrazo),
        pendentes: g.length - exp.length,
        otd: exp.length ? contar(exp, (e) => e.noPrazo) / exp.length : 0,
      }
    })

  const porTransp = agregar(exps('transportadora'), (e) => e.transportadora, (g) => {
    const exp = g.filter((e) => e.status === 'Expedido')
    return {
      rotulo: g[0].transportadora,
      noPrazo: contar(exp, (e) => e.noPrazo),
      foraPrazo: contar(exp, (e) => !e.noPrazo),
    }
  }).sort((a, b) => b.noPrazo + b.foraPrazo - (a.noPrazo + a.foraPrazo))

  const porRegiao = agregar(exps('regiao'), (e) => e.regiao, (g) => ({ rotulo: g[0].regiao, valor: somar(g, (e) => e.quantidade) }))
    .sort((a, b) => b.valor - a.valor)
    .map((r, i) => ({ ...r, cor: coresRegiao[i % coresRegiao.length] }))

  const porStatus = statusExp.map((s) => ({ id: s, rotulo: s, pedidos: contar(exps('status'), (e) => e.status === s) }))

  const colunas: Coluna<ExpedicaoT>[] = [
    { chave: 'pedido', titulo: 'Pedido', valor: (e) => e.pedido, render: (e) => <span className="font-medium text-slate-900">{e.pedido}</span> },
    { chave: 'cliente', titulo: 'Cliente', valor: (e) => e.cliente },
    { chave: 'regiao', titulo: 'Região', valor: (e) => e.regiao },
    { chave: 'produto', titulo: 'Produto', valor: (e) => e.produto },
    { chave: 'qtd', titulo: 'Qtd.', valor: (e) => e.quantidade, render: (e) => fmt.numero(e.quantidade), alinhar: 'right' },
    { chave: 'transp', titulo: 'Transportadora', valor: (e) => e.transportadora },
    { chave: 'data', titulo: 'Data prevista', valor: (e) => e.dataPrevista, render: (e) => fmt.data(e.dataPrevista) },
    {
      chave: 'prazo',
      titulo: 'Pontualidade',
      valor: (e) => (e.status !== 'Expedido' ? '—' : e.noPrazo ? 'No prazo' : 'Fora do prazo'),
      render: (e) =>
        e.status !== 'Expedido' ? '—' : <span className={e.noPrazo ? 'text-emerald-600' : 'font-semibold text-rose-600'}>{e.noPrazo ? 'No prazo' : 'Fora do prazo'}</span>,
    },
    { chave: 'status', titulo: 'Status', valor: (e) => e.status, render: (e) => <StatusBadge status={e.status} /> },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard titulo="Pedidos expedidos" valor={fmt.numero(expedidos.length)} icone={Send} detalhe={`de ${lista.length} pedidos no período`} />
        <KpiCard
          titulo="Entregas no prazo (OTD)"
          valor={fmt.pct(otd)}
          icone={Timer}
          tom="teal"
          progresso={{ valor: otd, meta: 0.95 }}
          detalhe="meta 95%"
        />
        <KpiCard titulo="Backlog de expedição" valor={fmt.numero(backlog)} icone={Clock3} tom="amber" detalhe="pedidos pendentes" />
        <KpiCard
          titulo="Pedidos atrasados"
          valor={fmt.numero(contar(lista, (e) => e.status === 'Atrasado'))}
          icone={PackageX}
          tom="rose"
          detalhe="aguardando expedição"
        />
        <KpiCard
          titulo="Unidades expedidas"
          valor={fmt.numero(somar(expedidos, (e) => e.quantidade))}
          icone={PackageCheck}
          tom="violet"
          detalhe="equipamentos e acessórios"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Expedições por mês" subtitulo="Pedidos no prazo, fora do prazo e pendentes · OTD" interativo className="xl:col-span-3">
          <TrendChart
            dados={mensal}
            series={[
              { chave: 'noPrazo', nome: 'No prazo', cor: cores.primaria, tipo: 'barra', pilha: 'e' },
              { chave: 'foraPrazo', nome: 'Fora do prazo', cor: cores.vermelho, tipo: 'barra', pilha: 'e' },
              { chave: 'pendentes', nome: 'Pendentes', cor: cores.cinza, tipo: 'barra', pilha: 'e' },
              { chave: 'otd', nome: 'OTD', cor: cores.teal, tipo: 'linha', eixoDireito: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={fmt.pct}
            dominioDireito={[0, 1]}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
        <ChartCard titulo="Unidades por região" subtitulo="Destino das expedições" interativo className="xl:col-span-2">
          <DonutChart
            dados={porRegiao}
            formatarValor={fmt.numero}
            centro={{ valor: fmt.numero(somar(porRegiao, (r) => r.valor)), rotulo: 'unidades' }}
            selecionado={selecao.regiao}
            onSelecionar={(id) => alternar('regiao', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard titulo="Desempenho por transportadora" subtitulo="Pedidos expedidos no prazo × fora do prazo" interativo>
          <BarChartWidget
            horizontal
            larguraRotulo={130}
            dados={porTransp}
            series={[
              { chave: 'noPrazo', nome: 'No prazo', cor: cores.primaria, pilha: 't' },
              { chave: 'foraPrazo', nome: 'Fora do prazo', cor: cores.vermelho, pilha: 't' },
            ]}
            formatarValor={fmt.numero}
            selecionado={selecao.transportadora}
            onSelecionar={(id) => alternar('transportadora', id)}
          />
        </ChartCard>
        <ChartCard titulo="Pedidos por status" subtitulo="Situação atual da carteira de expedição" interativo>
          <BarChartWidget
            dados={porStatus}
            series={[{ chave: 'pedidos', nome: 'Pedidos', cor: cores.primaria }]}
            corItem={(p) => corStatus[p.id as StatusExpedicao]}
            formatarValor={fmt.numero}
            selecionado={selecao.status}
            onSelecionar={(id) => alternar('status', id)}
          />
        </ChartCard>
      </div>

      <DataTable
        titulo="Pedidos de venda para expedição"
        colunas={colunas}
        linhas={lista}
        chaveLinha={(e) => e.pedido}
        ordenacaoInicial={{ chave: 'data', desc: true }}
      />
    </>
  )
}
