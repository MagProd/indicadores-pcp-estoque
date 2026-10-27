import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Download } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card } from './Card'

export interface Coluna<T> {
  chave: string
  titulo: string
  render?: (row: T) => React.ReactNode
  /** Valor usado para ordenação e exportação. */
  valor: (row: T) => string | number
  alinhar?: 'left' | 'right'
}

export function DataTable<T>({
  titulo,
  subtitulo,
  colunas,
  linhas,
  chaveLinha,
  porPagina = 8,
  ordenacaoInicial,
}: {
  titulo: string
  subtitulo?: string
  colunas: Coluna<T>[]
  linhas: T[]
  chaveLinha: (row: T) => string
  porPagina?: number
  ordenacaoInicial?: { chave: string; desc?: boolean }
}) {
  const { pode } = useAuth()
  const [ordem, setOrdem] = useState(ordenacaoInicial ?? { chave: colunas[0].chave, desc: false })
  const [pagina, setPagina] = useState(0)

  const ordenadas = useMemo(() => {
    const col = colunas.find((c) => c.chave === ordem.chave) ?? colunas[0]
    return [...linhas].sort((a, b) => {
      const va = col.valor(a)
      const vb = col.valor(b)
      const r = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')
      return ordem.desc ? -r : r
    })
  }, [linhas, colunas, ordem])

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const atual = Math.min(pagina, totalPaginas - 1)
  const visiveis = ordenadas.slice(atual * porPagina, (atual + 1) * porPagina)

  const exportar = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [colunas.map((c) => esc(c.titulo)).join(';'), ...ordenadas.map((r) => colunas.map((c) => esc(c.valor(r))).join(';'))].join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${titulo.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{titulo}</h2>
          {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{linhas.length} registros</span>
          {pode('dados:exportar') && (
            <button
              onClick={exportar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="size-3.5" /> Exportar CSV
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/70">
              {colunas.map((c) => (
                <th
                  key={c.chave}
                  className={`px-5 py-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase ${
                    c.alinhar === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <button
                    className="inline-flex items-center gap-1 hover:text-slate-800"
                    onClick={() => setOrdem((o) => ({ chave: c.chave, desc: o.chave === c.chave ? !o.desc : false }))}
                  >
                    {c.titulo}
                    {ordem.chave === c.chave && (ordem.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((r) => (
              <tr key={chaveLinha(r)} className="border-b border-slate-50 hover:bg-slate-50/60">
                {colunas.map((c) => (
                  <td key={c.chave} className={`px-5 py-2.5 whitespace-nowrap text-slate-700 ${c.alinhar === 'right' ? 'text-right tabular-nums' : ''}`}>
                    {c.render ? c.render(r) : c.valor(r)}
                  </td>
                ))}
              </tr>
            ))}
            {!visiveis.length && (
              <tr>
                <td colSpan={colunas.length} className="px-5 py-10 text-center text-sm text-slate-400">
                  Nenhum registro para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3 text-xs text-slate-500">
        <span>
          Página {atual + 1} de {totalPaginas}
        </span>
        <button disabled={atual === 0} onClick={() => setPagina(atual - 1)} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">
          Anterior
        </button>
        <button
          disabled={atual >= totalPaginas - 1}
          onClick={() => setPagina(atual + 1)}
          className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </Card>
  )
}
