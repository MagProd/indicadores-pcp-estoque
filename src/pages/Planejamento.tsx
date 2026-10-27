import { useMemo } from 'react'
import { AlertOctagon, CheckCircle2, ClipboardList, Cpu, Factory } from 'lucide-react'
import { BarChartWidget, type Ponto } from '@/components/charts/BarChartWidget'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { DataTable, type Coluna } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { contar, somar } from '@/domain/aggregate'
import { fmt } from '@/domain/format'
import * as ind from '@/domain/indicators'
import type { DashboardDataset, OrdemProducao, StatusOP } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

const statusOP: StatusOP[] = ['Planejada', 'Liberada', 'Em produção', 'Concluída', 'Atrasada']
const corStatus: Record<StatusOP, string> = {
  Planejada: cores.cinza,
  Liberada: cores.primariaClara,
  'Em produção': cores.primaria,
  Concluída: cores.teal,
  Atrasada: cores.vermelho,
}

export function Planejamento({ dataset }: { dataset: DashboardDataset }) {
  const { fatos, filtrar, selecao, alternar } = useRecorte(dataset)

  const ordens = (ignorar?: Parameters<typeof fatos>[0]) =>
    filtrar<OrdemProducao>(dataset.ordens, { campoData: 'inicioPlanejado', ignorar })

  const recorte = useMemo(() => fatos(), [fatos])
  const ops = ind.ordensProducao(recorte)
  const listaOrdens = ordens()
  const atrasadas = contar(listaOrdens, (o) => o.status === 'Atrasada')

  const mensal = ind.serieMensal(fatos('mes'), (g) => ({
    id: g[0].mes,
    rotulo: fmt.mes(g[0].mes),
    ...ind.ordensProducao(g),
    capacidade: somar(g, (f) => f.capacidadeHoras),
    utilizadas: somar(g, (f) => f.horasUtilizadas),
    utilizacao: ind.utilizacaoCapacidade(g),
  }))

  const porLinha = [...ind.agruparPor(ordens('linha'), (o) => o.linha).entries()]
    .map(([id, g]): Ponto => ({
      id,
      rotulo: id.split(' · ')[1] ?? id,
      ...Object.fromEntries(statusOP.map((s) => [s, contar(g, (o) => o.status === s)])),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const porStatus = statusOP.map((s) => ({
    id: s,
    rotulo: s,
    valor: contar(ordens('status'), (o) => o.status === s),
    cor: corStatus[s],
  }))

  const colunas: Coluna<OrdemProducao>[] = [
    { chave: 'numero', titulo: 'OP', valor: (o) => o.numero, render: (o) => <span className="font-medium text-slate-900">{o.numero}</span> },
    { chave: 'produto', titulo: 'Produto', valor: (o) => o.produto },
    { chave: 'linha', titulo: 'Linha', valor: (o) => o.linha },
    { chave: 'inicio', titulo: 'Início', valor: (o) => o.inicioPlanejado, render: (o) => fmt.data(o.inicioPlanejado) },
    { chave: 'fim', titulo: 'Término', valor: (o) => o.fimPlanejado, render: (o) => fmt.data(o.fimPlanejado) },
    { chave: 'qtd', titulo: 'Qtd. planejada', valor: (o) => o.quantidade, render: (o) => fmt.numero(o.quantidade), alinhar: 'right' },
    {
      chave: 'prod',
      titulo: 'Produzido',
      valor: (o) => o.quantidadeProduzida / o.quantidade,
      alinhar: 'right',
      render: (o) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-16 rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(o.quantidadeProduzida / o.quantidade) * 100}%` }} />
          </span>
          {fmt.pct(o.quantidadeProduzida / o.quantidade)}
        </span>
      ),
    },
    { chave: 'status', titulo: 'Status', valor: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard titulo="OPs planejadas" valor={fmt.numero(ops.planejadas)} icone={ClipboardList} detalhe="no período" />
        <KpiCard titulo="OPs realizadas" valor={fmt.numero(ops.realizadas)} icone={CheckCircle2} tom="teal" detalhe="no período" />
        <KpiCard
          titulo="Aderência ao plano"
          valor={fmt.pct(ops.aderencia)}
          icone={Factory}
          progresso={{ valor: ops.aderencia, meta: 0.95 }}
          detalhe="meta 95%"
          variacao={ind.tendencia(recorte, (f) => ind.ordensProducao(f).aderencia)}
        />
        <KpiCard
          titulo="Utilização da capacidade"
          valor={fmt.pct(ind.utilizacaoCapacidade(recorte))}
          icone={Cpu}
          tom="violet"
          progresso={{ valor: ind.utilizacaoCapacidade(recorte), meta: 0.85 }}
          detalhe="horas utilizadas ÷ disponíveis"
        />
        <KpiCard titulo="OPs em atraso" valor={fmt.numero(atrasadas)} icone={AlertOctagon} tom="rose" detalhe={`de ${listaOrdens.length} OPs na carteira`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Aderência ao plano de produção" subtitulo="OPs planejadas × realizadas por mês" interativo className="xl:col-span-3">
          <TrendChart
            dados={mensal}
            series={[
              { chave: 'planejadas', nome: 'Planejadas', cor: cores.primariaClara, tipo: 'barra' },
              { chave: 'realizadas', nome: 'Realizadas', cor: cores.primaria, tipo: 'barra' },
              { chave: 'aderencia', nome: 'Aderência', cor: cores.teal, tipo: 'linha', eixoDireito: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={fmt.pct}
            dominioDireito={[0.6, 1]}
            meta={{ valor: 0.95, rotulo: 'Meta 95%', eixoDireito: true }}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
        <ChartCard titulo="Carteira de OPs por status" subtitulo="Quantidade de ordens" interativo className="xl:col-span-2">
          <DonutChart
            dados={porStatus}
            formatarValor={fmt.numero}
            centro={{ valor: fmt.numero(somar(porStatus, (s) => s.valor)), rotulo: 'ordens' }}
            selecionado={selecao.status}
            onSelecionar={(id) => alternar('status', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard titulo="OPs por linha de produção" subtitulo="Distribuição por status" interativo>
          <BarChartWidget
            dados={porLinha}
            series={statusOP.map((s) => ({ chave: s, nome: s, cor: corStatus[s], pilha: 'st' }))}
            formatarValor={fmt.numero}
            selecionado={selecao.linha}
            onSelecionar={(id) => alternar('linha', id)}
          />
        </ChartCard>
        <ChartCard titulo="Capacidade produtiva" subtitulo="Horas disponíveis × utilizadas" interativo>
          <TrendChart
            dados={mensal}
            series={[
              { chave: 'capacidade', nome: 'Horas disponíveis', cor: cores.primariaClara, tipo: 'area' },
              { chave: 'utilizadas', nome: 'Horas utilizadas', cor: cores.primaria, tipo: 'area' },
              { chave: 'utilizacao', nome: 'Utilização', cor: cores.violeta, tipo: 'linha', eixoDireito: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={fmt.pct}
            dominioDireito={[0.5, 1]}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
      </div>

      <DataTable
        titulo="Ordens de produção"
        subtitulo="Carteira filtrada pelo período, família, produto e seleções"
        colunas={colunas}
        linhas={listaOrdens}
        chaveLinha={(o) => o.numero}
        ordenacaoInicial={{ chave: 'inicio', desc: true }}
      />
    </>
  )
}
