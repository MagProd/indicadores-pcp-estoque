import { agruparPor } from './indicators'

/** Agrega registros por uma chave, aplicando um cálculo a cada grupo. */
export function agregar<T, R extends object>(rows: T[], chave: (r: T) => string, calc: (grupo: T[], id: string) => R) {
  const grupos = agruparPor(rows, chave)
  return [...grupos.entries()].map(([id, grupo]) => ({ id, ...calc(grupo, id) }))
}

export const somar = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0)
export const contar = <T,>(rows: T[], f: (r: T) => boolean) => rows.reduce((s, r) => s + (f(r) ? 1 : 0), 0)
