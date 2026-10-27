import { useMemo } from 'react'
import { AlarmClock, Factory, Gauge, PackageOpen, RefreshCcw, Target } from 'lucide-react'
import { BarChartWidget } from '@/components/charts/BarChartWidget'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores, coresFamilia } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { KpiCard } from '@/components/ui/KpiCard'
import { agregar, somar } from '@/domain/aggregate'
import { fmt } from '@/domain/format'
import * as ind from '@/domain/indicators'
import type { DashboardDataset, FamiliaId } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

export function VisaoGeral({ dataset }: { dataset: DashboardDataset }) {
  const { fatos, selecao, alternar, nomeFamilia, produto } = useRecorte(dataset)

  const recorte = useMemo(() => fatos(), [fatos])
  const kpis = useMemo(
    () => ({
      valor: ind.valorEstoque(recorte),
      tendValor: ind.tendencia(recorte, ind.valorEstoque),
      cobertura: ind.coberturaDias(recorte),
      giro: ind.giroEstoque(recorte),
      tendGiro: ind.tendencia(recorte, ind.giroEstoque),
      ops: ind.ordensProducao(recorte),
      acuracidade: ind.acuracidadePrevisao(recorte),
      tendAcur: ind.tendencia(recorte, ind.acuracidadePrevisao),
      pcs: ind.pedidosCompra(recorte),
      tendPc: ind.tendencia(recorte, (f) => ind.pedidosCompra(f).atraso),
    }),
    [recorte],
  )

  const porFamilia = useMemo(() => {
    const base = fatos('familia')
    return agregar(base, (f) => f.familia, (g, id) => ({
      rotulo: nomeFamilia(id),
      valor: ind.valorEstoque(g),
      atraso: ind.pedidosCompra(g).atraso,
      noPrazo: ind.pedidosCompra(g).emitidos - ind.pedidosCompra(g).atraso,
    })).sort((a, b) => b.valor - a.valor)
  }, [fatos, nomeFamilia])

  const mensal = useMemo(
    () =>
      ind.serieMensal(fatos('mes'), (g) => {
        const op = ind.ordensProducao(g)
        return {
          id: g[0].mes,
          rotulo: fmt.mes(g[0].mes),
          planejadas: op.planejadas,
          realizadas: op.realizadas,
          aderencia: op.aderencia,
          previsao: somar(g, (f) => f.previsaoVendas),
          vendas: somar(g, (f) => f.vendasReais),
          acuracidade: ind.acuracidadePrevisao(g),
        }
      }),
    [fatos],
  )

  const topProdutos = useMemo(() => {
    const base = fatos('produto')
    return agregar(base, (f) => f.produto, (g, id) => ({ rotulo: id, valor: ind.valorEstoque(g), familia: g[0].familia }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10)
  }, [fatos])

  const abc = useMemo(() => {
    const base = fatos('curvaABC')
    const corABC = { A: cores.primaria, B: cores.primariaClara, C: cores.cinza }
    return (['A', 'B', 'C'] as const).map((c) => ({
      id: c,
      rotulo: `Curva ${c}`,
      valor: ind.valorEstoque(base.filter((f) => produto(f.produto)?.curvaABC === c)),
      cor: corABC[c],
    }))
  }, [fatos, produto])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          titulo="Valor total do estoque"
          valor={fmt.moedaCompacta(kpis.valor)}
          icone={PackageOpen}
          variacao={kpis.tendValor}
          maiorMelhor={false}
          detalhe="vs. início do período"
        />
        <KpiCard
          titulo="Cobertura de estoque"
          valor={fmt.dias(kpis.cobertura)}
          icone={Gauge}
          tom="teal"
          detalhe="Meta: 45 a 60 dias"
          progresso={{ valor: Math.min(1, kpis.cobertura / 90), meta: 60 / 90 }}
        />
        <KpiCard
          titulo="Giro de estoque"
          valor={`${fmt.decimal(kpis.giro)}x`}
          icone={RefreshCcw}
          tom="violet"
          variacao={kpis.tendGiro}
          detalhe="anualizado"
        />
        <KpiCard
          titulo="Ordens de produção (plan. × real.)"
          valor={`${fmt.numero(kpis.ops.planejadas)} / ${fmt.numero(kpis.ops.realizadas)}`}
          icone={Factory}
          detalhe={`Aderência ${fmt.pct(kpis.ops.aderencia)} · meta 95%`}
          progresso={{ valor: kpis.ops.aderencia, meta: 0.95 }}
        />
        <KpiCard
          titulo="Acuracidade da previsão de vendas"
          valor={fmt.pct(kpis.acuracidade)}
          icone={Target}
          tom="teal"
          variacao={kpis.tendAcur}
          detalhe="meta 85%"
          progresso={{ valor: kpis.acuracidade, meta: 0.85 }}
        />
        <KpiCard
          titulo="Pedidos de compra em atraso"
          valor={fmt.numero(kpis.pcs.atraso)}
          icone={AlarmClock}
          tom="rose"
          variacao={kpis.tendPc}
          maiorMelhor={false}
          detalhe={`${fmt.pct(kpis.pcs.pctAtraso)} dos ${fmt.numero(kpis.pcs.emitidos)} emitidos`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Valor de estoque por família" subtitulo="Posição no último mês do período" interativo className="xl:col-span-2">
          <BarChartWidget
            horizontal
            larguraRotulo={176}
            dados={porFamilia}
            series={[{ chave: 'valor', nome: 'Valor em estoque', cor: cores.primaria }]}
            corItem={(p) => coresFamilia[p.id as FamiliaId]}
            formatarValor={fmt.moedaCompacta}
            selecionado={selecao.familia}
            onSelecionar={(id) => alternar('familia', id)}
          />
        </ChartCard>
        <ChartCard
          titulo="Ordens de produção planejadas × realizadas"
          subtitulo="Quantidade mensal de OPs e aderência ao plano · clique em um mês"
          interativo
          className="xl:col-span-3"
        >
          <TrendChart
            dados={mensal}
            series={[
              { chave: 'planejadas', nome: 'Planejadas', cor: cores.primariaClara, tipo: 'barra' },
              { chave: 'realizadas', nome: 'Realizadas', cor: cores.primaria, tipo: 'barra' },
              { chave: 'aderencia', nome: 'Aderência', cor: cores.teal, tipo: 'linha', eixoDireito: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={(v) => fmt.pct(v)}
            dominioDireito={[0.6, 1]}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard
          titulo="Previsão de vendas × vendas realizadas"
          subtitulo="Unidades por mês e acuracidade da previsão (WMAPE)"
          interativo
          className="xl:col-span-3"
        >
          <TrendChart
            dados={mensal}
            series={[
              { chave: 'vendas', nome: 'Vendas realizadas', cor: cores.primaria, tipo: 'area' },
              { chave: 'previsao', nome: 'Previsão', cor: cores.ambar, tipo: 'linha', tracejada: true },
              { chave: 'acuracidade', nome: 'Acuracidade', cor: cores.teal, tipo: 'linha', eixoDireito: true },
            ]}
            formatarValor={fmt.numero}
            formatarDireito={(v) => fmt.pct(v)}
            dominioDireito={[0.5, 1]}
            meta={{ valor: 0.85, rotulo: 'Meta 85%', eixoDireito: true }}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
        <ChartCard titulo="Estoque por curva ABC" subtitulo="Participação no valor em estoque" interativo className="xl:col-span-2">
          <DonutChart
            dados={abc}
            formatarValor={fmt.moedaCompacta}
            centro={{ valor: fmt.moedaCompacta(abc.reduce((s, d) => s + d.valor, 0)), rotulo: 'em estoque' }}
            selecionado={selecao.curvaABC}
            onSelecionar={(id) => alternar('curvaABC', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Top 10 produtos por valor de estoque" subtitulo="Código do produto" interativo className="xl:col-span-3" altura={340}>
          <BarChartWidget
            horizontal
            larguraRotulo={110}
            dados={topProdutos}
            series={[{ chave: 'valor', nome: 'Valor em estoque', cor: cores.primaria }]}
            corItem={(p) => coresFamilia[p.familia as FamiliaId]}
            formatarValor={fmt.moedaCompacta}
            selecionado={selecao.produto}
            onSelecionar={(id) => alternar('produto', id)}
          />
        </ChartCard>
        <ChartCard titulo="Pedidos de compra por família" subtitulo="No prazo × em atraso no período" interativo className="xl:col-span-2" altura={340}>
          <BarChartWidget
            dados={porFamilia.map((f) => ({ ...f, rotulo: f.id }))}
            series={[
              { chave: 'noPrazo', nome: 'No prazo', cor: cores.primariaClara, pilha: 'pc' },
              { chave: 'atraso', nome: 'Em atraso', cor: cores.vermelho, pilha: 'pc' },
            ]}
            formatarValor={fmt.numero}
            selecionado={selecao.familia}
            onSelecionar={(id) => alternar('familia', id)}
          />
        </ChartCard>
      </div>
    </>
  )
}
