import type { EscalaMes } from '../types'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export interface MesRef {
  ano: number
  mes: number
}

export function mesKey(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}`
}

export function mesKeyFromEscala(escala: MesRef): string {
  return mesKey(escala.ano, escala.mes)
}

export function parseMesKey(key: string): MesRef | null {
  const match = key.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const ano = Number(match[1])
  const mes = Number(match[2])
  if (mes < 1 || mes > 12) return null
  return { ano, mes }
}

export function compareMes(a: MesRef, b: MesRef): number {
  if (a.ano !== b.ano) return a.ano - b.ano
  return a.mes - b.mes
}

export function formatMesAno(ano: number, mes: number): string {
  return `${MESES[mes - 1] ?? ''} ${ano}`.trim()
}

export function formatMesCurto(ano: number, mes: number): string {
  const nome = MESES[mes - 1] ?? ''
  return `${nome.slice(0, 3)} ${ano}`
}

export function getMesNome(mes: number): string {
  return MESES[mes - 1] ?? ''
}

export function getCurrentMesKey(): string {
  const now = new Date()
  return mesKey(now.getFullYear(), now.getMonth() + 1)
}

/** Até `max` meses para os cards: os mais recentes, garantindo o selecionado visível. */
export function ultimosMesesParaCards(
  opcoes: EscalaMes[],
  selectedKey: string | null,
  max = 3,
): EscalaMes[] {
  if (opcoes.length <= max) return opcoes

  const ultimos = opcoes.slice(-max)
  if (!selectedKey || ultimos.some((e) => mesKeyFromEscala(e) === selectedKey)) {
    return ultimos
  }

  const selecionado = opcoes.find((e) => mesKeyFromEscala(e) === selectedKey)
  if (!selecionado) return ultimos

  return [...ultimos.slice(1), selecionado]
}

const STORAGE_KEY = 'escala-mesc-mes-ativo'

export function readSavedMesKey(): string | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null
  return parseMesKey(saved) ? saved : null
}

export function saveMesKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

export function pickDefaultMesKey(
  opcoes: EscalaMes[],
  savedKey: string | null,
): string | null {
  if (opcoes.length === 0) return null

  if (savedKey && opcoes.some((e) => mesKeyFromEscala(e) === savedKey)) {
    return savedKey
  }

  const current = getCurrentMesKey()
  if (opcoes.some((e) => mesKeyFromEscala(e) === current)) {
    return current
  }

  return mesKeyFromEscala(opcoes[opcoes.length - 1])
}
