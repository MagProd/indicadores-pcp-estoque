const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const dec1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const fmt = {
  moeda: (v: number) => brl.format(v),
  /** R$ 12,4 mi / R$ 820 mil */
  moedaCompacta: (v: number) => {
    const abs = Math.abs(v)
    if (abs >= 1e9) return `R$ ${dec1.format(v / 1e9)} bi`
    if (abs >= 1e6) return `R$ ${dec1.format(v / 1e6)} mi`
    if (abs >= 1e3) return `R$ ${num.format(v / 1e3)} mil`
    return brl.format(v)
  },
  numero: (v: number) => num.format(v),
  decimal: (v: number) => dec1.format(v),
  pct: (v: number) => `${dec1.format(v * 100)}%`,
  dias: (v: number) => `${num.format(v)} dias`,
  /** "2026-03" → "mar/26" */
  mes: (m: string) => `${mesesAbrev[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`,
  /** "2026-03-14" → "14/03/2026" */
  data: (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`,
  dataHora: (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(iso)),
}
