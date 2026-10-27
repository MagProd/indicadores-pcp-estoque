import { useMemo } from 'react'
import { AlertTriangle, Archive, Gauge, PackageOpen, RefreshCcw } from 'lucide-react'
import { BarChartWidget, type Ponto } from '@/components/charts/BarChartWidget'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cores, coresFamilia } from '@/components/charts/theme'
import { ChartCard } from '@/components/ui/ChartCard'
import { DataTable, type Coluna } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { agregar, contar, somar } from '@/domain/aggregate'
import { fmt } from '@/domain/format'
import * as ind from '@/domain/indicators'
import type { DashboardDataset, FamiliaId, PosicaoEstoque } from '@/domain/types'
import { useRecorte } from '@/hooks/useRecorte'

const COBERTURA_EXCESSO = 120

function statusPosicao(p: PosicaoEstoque) {
  if (p.quantidade === 0) return 'Ruptura'
  if (p.quantidade < p.estoqueSeguranca) return 'Abaixo do ES'
  if (p.coberturaDias > COBERTURA_EXCESSO) return 'Excesso'
  return 'Adequado'
}

export function Estoques({ dataset }: { dataset: DashboardDataset }) {
  const { fatos, filtrar, selecao, alternar, nomeFamilia, produto } = useRecorte(dataset)

  const resolverABC = { curvaABC: (r: { produto: string }) => produto(r.produto)?.curvaABC }
  const posicoes = (ignorar?: Parameters<typeof fatos>[0]) =>
    filtrar<PosicaoEstoque>(dataset.posicoes, { ignorar, resolver: resolverABC })

  const recorte = useMemo(() => fatos(), [fatos])
  const listaPosicoes = posicoes()
  const abaixoES = contar(listaPosicoes, (p) => statusPosicao(p) === 'Abaixo do ES')
  const excesso = contar(listaPosicoes, (p) => statusPosicao(p) === 'Excesso')

  const familiasMes = useMemo(() => [...new Set(recorte.map((f) => f.familia))], [recorte])
  const evolucao = ind.serieMensal(fatos('mes'), (g): Ponto => ({
    id: g[0].mes,
    rotulo: fmt.mes(g[0].mes),
    ...Object.fromEntries(dataset.familias.map((f) => [f.id, somar(g.filter((x) => x.familia === f.id), (x) => x.valorEstoque)])),
  }))

  const porDeposito = agregar(posicoes('deposito'), (p) => p.deposito, (g) => ({ rotulo: g[0].deposito, valor: somar(g, (p) => p.valor) }))

  const coberturaFamilia = agregar(fatos('familia'), (f) => f.familia, (g, id) => ({
    rotulo: nomeFamilia(id),
    cobertura: Math.round(ind.coberturaDias(g)),
    giro: ind.giroEstoque(g),
  })).sort((a, b) => b.cobertura - a.cobertura)

  const abc = (['A', 'B', 'C'] as const).map((c) => ({
    id: c,
    rotulo: `Curva ${c}`,
    valor: somar(
      posicoes('curvaABC').filter((p) => produto(p.produto)?.curvaABC === c),
      (p) => p.valor,
    ),
    cor: { A: cores.primaria, B: cores.primariaClara, C: cores.cinza }[c],
  }))

  const colunas: Coluna<PosicaoEstoque>[] = [
    { chave: 'produto', titulo: 'Código', valor: (p) => p.produto, render: (p) => <span className="font-medium text-slate-900">{p.produto}</span> },
    { chave: 'descricao', titulo: 'Descrição', valor: (p) => produto(p.produto)?.descricao ?? '' },
    { chave: 'abc', titulo: 'ABC', valor: (p) => produto(p.produto)?.curvaABC ?? '' },
    { chave: 'deposito', titulo: 'Depósito', valor: (p) => p.deposito },
    { chave: 'qtd', titulo: 'Quantidade', valor: (p) => p.quantidade, render: (p) => fmt.numero(p.quantidade), alinhar: 'right' },
    { chave: 'es', titulo: 'Est. segurança', valor: (p) => p.estoqueSeguranca, render: (p) => fmt.numero(p.estoqueSeguranca), alinhar: 'right' },
    { chave: 'valor', titulo: 'Valor', valor: (p) => p.valor, render: (p) => fmt.moeda(p.valor), alinhar: 'right' },
    { chave: 'cob', titulo: 'Cobertura', valor: (p) => p.coberturaDias, render: (p) => fmt.dias(p.coberturaDias), alinhar: 'right' },
    { chave: 'status', titulo: 'Situação', valor: statusPosicao, render: (p) => <StatusBadge status={statusPosicao(p)} /> },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          titulo="Valor total do estoque"
          valor={fmt.moedaCompacta(ind.valorEstoque(recorte))}
          icone={PackageOpen}
          variacao={ind.tendencia(recorte, ind.valorEstoque)}
          maiorMelhor={false}
          detalhe="vs. início do período"
        />
        <KpiCard titulo="Cobertura média" valor={fmt.dias(ind.coberturaDias(recorte))} icone={Gauge} tom="teal" detalhe="Meta: 45 a 60 dias" />
        <KpiCard titulo="Giro de estoque" valor={`${fmt.decimal(ind.giroEstoque(recorte))}x`} icone={RefreshCcw} tom="violet" detalhe="anualizado" />
        <KpiCard titulo="Posições abaixo do estoque de segurança" valor={fmt.numero(abaixoES)} icone={AlertTriangle} tom="amber" detalhe={`de ${listaPosicoes.length} posições`} />
        <KpiCard titulo="Posições em excesso" valor={fmt.numero(excesso)} icone={Archive} tom="rose" detalhe={`cobertura > ${COBERTURA_EXCESSO} dias`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <ChartCard titulo="Evolução do valor em estoque" subtitulo="Por família de produtos · clique em um mês" interativo className="xl:col-span-3">
          <TrendChart
            dados={evolucao}
            series={dataset.familias
              .filter((f) => familiasMes.includes(f.id))
              .map((f) => ({ chave: f.id, nome: f.nome, cor: coresFamilia[f.id], tipo: 'barra' as const, pilha: 'fam' }))}
            formatarValor={fmt.moedaCompacta}
            selecionado={selecao.mes}
            onSelecionar={(id) => alternar('mes', id)}
          />
        </ChartCard>
        <ChartCard titulo="Classificação ABC" subtitulo="Valor em estoque por curva" interativo className="xl:col-span-2">
          <DonutChart
            dados={abc}
            formatarValor={fmt.moedaCompacta}
            centro={{ valor: fmt.moedaCompacta(somar(abc, (a) => a.valor)), rotulo: 'posição atual' }}
            selecionado={selecao.curvaABC}
            onSelecionar={(id) => alternar('curvaABC', id)}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard titulo="Cobertura por família" subtitulo="Dias de consumo cobertos pelo estoque atual" interativo>
          <BarChartWidget
            horizontal
            larguraRotulo={176}
            dados={coberturaFamilia}
            series={[{ chave: 'cobertura', nome: 'Cobertura (dias)', cor: cores.teal }]}
            corItem={(p) => (Number(p.cobertura) > 60 ? cores.ambar : Number(p.cobertura) < 45 ? cores.vermelho : cores.teal)}
            formatarValor={(v) => `${fmt.numero(v)} d`}
            selecionado={selecao.familia}
            onSelecionar={(id) => alternar('familia', id as FamiliaId)}
          />
        </ChartCard>
        <ChartCard titulo="Valor por depósito" subtitulo="Posição atual" interativo>
          <BarChartWidget
            dados={porDeposito}
            series={[{ chave: 'valor', nome: 'Valor', cor: cores.primaria }]}
            formatarValor={fmt.moedaCompacta}
            selecionado={selecao.deposito}
            onSelecionar={(id) => alternar('deposito', id)}
          />
        </ChartCard>
      </div>

      <DataTable
        titulo="Posição de estoque"
        subtitulo="Saldo atual por produto e depósito"
        colunas={colunas}
        linhas={listaPosicoes}
        chaveLinha={(p) => `${p.produto}-${p.deposito}`}
        ordenacaoInicial={{ chave: 'valor', desc: true }}
      />
    </>
  )
}
