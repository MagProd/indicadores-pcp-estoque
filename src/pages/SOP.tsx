import { useMemo } from 'react'
import { Scale, Target, TrendingUp, Warehouse, Waypoints } from 'lucide-react'
import { BarChartWidget, type Ponto } from '@/components/charts/BarChartWidget'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { DataTable, type Coluna } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/ui/KpiCard'
import { agregar, somar } from '@/domain/aggregate'
import { fmt } from '@/domain/format'
import * as ind from '@/domain/indicators'
import type { DashboardDataset } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

interface LinhaPlano {
  id: string
  familia: string
  demanda: number
  oferta: number
  capacidade: number
}

export function SOP({ dataset }: { dataset: DashboardDataset }) {
  const { fatos, filtrar, selecao, alternar, nomeFamilia } = useRecorte(dataset)

  const recorte = useMemo(() => fatos(), [fatos])
  // Projeção futura: não se aplica período nem seleção de mês histórico.
  const projecao = filtrar(dataset.projecaoSOP, { ignorar: 'mes' })
  const demanda6m = somar(projecao, (p) => p.demanda)
  const oferta6m = somar(projecao, (p) => p.oferta)
  const capacidade6m = somar(projecao, (p) => p.capacidade)
  const vies = ind.viesPrevisao(recorte)

  const historico = ind.serieMensal(fatos('mes'), (g): Ponto => ({
    id: g[0].mes,
    rotulo: fmt.mes(g[0].mes),
    vendas: somar(g, (f) => f.vendasReais),
    previsao: somar(g, (f) => f.previsaoVendas),
    acuracidade: ind.acuracidadePrevisao(g),
  }))

  const futuro = [...ind.agruparPor(projecao, (p) => p.mes).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, g]): Ponto => ({
      id: mes,
      rotulo: fmt.mes(mes),
      demandaProj: somar(g, (p) => p.demanda),
      oferta: somar(g, (p) => p.oferta),
      capacidade: somar(g, (p) => p.capacidade),
    }))

  // Une histórico e projeção numa única linha do tempo.
  const linhaTempo: Ponto[] = [...historico.map(({ id, rotulo, vendas, previsao }) => ({ id, rotulo, vendas, previsao })), ...futuro]

  const acurFamilia = agregar(fatos('familia'), (f) => f.familia, (g, id) => ({
    rotulo: nomeFamilia(id),
    acuracidade: ind.acuracidadePrevisao(g),
    vies: ind.viesPrevisao(g),
  })).sort((a, b) => b.acuracidade - a.acuracidade)

  const plano: LinhaPlano[] = agregar(projecao, (p) => p.familia, (g, id) => ({
    familia: nomeFamilia(id),
    demanda: somar(g, (p) => p.demanda),
    oferta: somar(g, (p) => p.oferta),
    capacidade: somar(g, (p) => p.capacidade),
  }))

  const colunas: Coluna<LinhaPlano>[] = [
    { chave: 'familia', titulo: 'Família', valor: (l) => l.familia, render: (l) => <span className="font-medium text-slate-900">{l.familia}</span> },
    { chave: 'demanda', titulo: 'Demanda (un.)', valor: (l) => l.demanda, render: (l) => fmt.numero(l.demanda), alinhar: 'right' },
    { chave: 'oferta', titulo: 'Oferta planejada (un.)', valor: (l) => l.oferta, render: (l) => fmt.numero(l.oferta), alinhar: 'right' },
    { chave: 'capacidade', titulo: 'Capacidade (un.)', valor: (l) => l.capacidade, render: (l) => fmt.numero(l.capacidade), alinhar: 'right' },
    {
      chave: 'gap',
      titulo: 'Gap oferta − demanda',
      valor: (l) => l.oferta - l.demanda,
      alinhar: 'right',
      render: (l) => (
        <span className={l.oferta - l.demanda < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-600'}>
          {l.oferta - l.demanda > 0 ? '+' : ''}
          {fmt.numero(l.oferta - l.demanda)}
        </span>
      ),
    },
    {
      chave: 'atend',
      titulo: 'Atendimento',
      valor: (l) => (l.demanda ? l.oferta / l.demanda : 0),
      render: (l) => fmt.pct(l.demanda ? l.oferta / l.demanda : 0),
      alinhar: 'right',
    },
    {
      chave: 'uso',
      titulo: 'Uso da capacidade',
      valor: (l) => (l.capacidade ? l.oferta / l.capacidade : 0),
      render: (l) => fmt.pct(l.capacidade ? l.oferta / l.capacidade : 0),
      alinhar: 'right',
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          titulo="Acuracidade da previsão"
          valor={fmt.pct(ind.acuracidadePrevisao(recorte))}
          icone={Target}
          progresso={{ valor: ind.acuracidadePrevisao(recorte), meta: 0.85 }}
          detalhe="1 − WMAPE · meta 85%"
        />
        <KpiCard
          titulo="Viés da previsão"
          valor={`${vies > 0 ? '+' : ''}${fmt.pct(vies)}`}
          icone={Scale}
          tom="amber"
          detalhe={vies > 0 ? 'previsão acima do realizado' : 'previsão abaixo do realizado'}
        />
        <KpiCard titulo="Demanda projetada (6 meses)" valor={fmt.numero(demanda6m)} icone={TrendingUp} tom="teal" detalhe="unidades" />
        <KpiCard
          titulo="Oferta planejada (6 meses)"
          valor={fmt.numero(oferta6m)}
          icone={Warehouse}
          tom="violet"
          detalhe={`${fmt.pct(demanda6m ? oferta6m / demanda6m : 0)} da demanda`}
          progresso={{ valor: demanda6m ? Math.min(1, oferta6m / demanda6m) : 0, meta: 0.98 }}
        />
        <KpiCard
          titulo="Uso da capacidade projetada"
          valor={fmt.pct(capacidade6m ? oferta6m / capacidade6m : 0)}
          icone={Waypoints}
          detalhe={`capacidade ${fmt.numero(capacidade6m)} un.`}
        />
      </div>

      <ChartCard
        titulo="Demanda × oferta — histórico e horizonte S&OP"
        subtitulo="Vendas realizadas e previsão (12 meses) + demanda projetada, oferta e capacidade (6 meses à frente)"
        interativo
        altura={340}
      >
        <TrendChart
          dados={linhaTempo}
          series={[
            { chave: 'vendas', nome: 'Vendas realizadas', cor: cores.primaria, tipo: 'barra' },
            { chave: 'previsao', nome: 'Previsão', cor: cores.ambar, tipo: 'linha', tracejada: true },
            { chave: 'demandaProj', nome: 'Demanda projetada', cor: cores.primariaClara, tipo: 'barra' },
            { chave: 'oferta', nome: 'Oferta planejada', cor: cores.teal, tipo: 'linha' },
            { chave: 'capacidade', nome: 'Capacidade', cor: cores.vermelho, tipo: 'linha', tracejada: true },
          ]}
          formatarValor={fmt.numero}
          selecionado={selecao.mes}
          onSelecionar={(id) => historico.some((h) => h.id === id) && alternar('mes', id)}
        />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard titulo="Acuracidade por família" subtitulo="Verde ≥ 85% · âmbar 75–85% · vermelho < 75%" interativo>
          <BarChartWidget
            horizontal
            larguraRotulo={176}
            dados={acurFamilia}
            series={[{ chave: 'acuracidade', nome: 'Acuracidade', cor: cores.teal }]}
            corItem={(p) => (Number(p.acuracidade) >= 0.85 ? cores.teal : Number(p.acuracidade) >= 0.75 ? cores.ambar : cores.vermelho)}
            formatarValor={fmt.pct}
            selecionado={selecao.familia}
            onSelecionar={(id) => alternar('familia', id)}
          />
        </ChartCard>
        <ChartCard titulo="Acuracidade mensal da previsão" subtitulo="Evolução frente à meta" interativo>
          <TrendChart
            dados={historico}
            series={[{ chave: 'acuracidade', nome: 'Acuracidade', cor: cores.primaria, tipo: 'area' }]}
            formatarValor={fmt.pct}
            meta={{ valor: 0.85, rotulo: 'Meta 85%' }}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
      </div>

      <DataTable
        titulo="Plano consolidado por família"
        subtitulo="Horizonte de 6 meses à frente"
        colunas={colunas}
        linhas={plano}
        chaveLinha={(l) => l.id}
        ordenacaoInicial={{ chave: 'gap' }}
      />
    </>
  )
}
