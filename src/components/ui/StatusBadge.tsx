const cores: Record<string, string> = {
  verde: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  azul: 'bg-brand-50 text-brand-700 ring-brand-200',
  ambar: 'bg-amber-50 text-amber-700 ring-amber-200',
  vermelho: 'bg-rose-50 text-rose-700 ring-rose-200',
  cinza: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const mapa: Record<string, keyof typeof cores> = {
  Concluída: 'verde',
  Recebido: 'verde',
  Expedido: 'verde',
  'No prazo': 'azul',
  'Em produção': 'azul',
  Liberada: 'azul',
  'Em separação': 'azul',
  Planejada: 'cinza',
  'Aguardando NF': 'ambar',
  Parcial: 'ambar',
  Excesso: 'ambar',
  Atrasada: 'vermelho',
  'Em atraso': 'vermelho',
  Atrasado: 'vermelho',
  Ruptura: 'vermelho',
  'Abaixo do ES': 'ambar',
  Adequado: 'verde',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ${cores[mapa[status] ?? 'cinza']}`}>
      {status}
    </span>
  )
}
