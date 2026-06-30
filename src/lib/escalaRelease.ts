import type { EscalaMes } from '../types'
import { formatMesAno, parseMesKey, compareMes, type MesRef } from './mesRef'

function resolveReleaseLimit(escalaLiberadaAte?: string): MesRef | null {
  const raw = escalaLiberadaAte?.trim()
  if (!raw) return null
  return parseMesKey(raw)
}

/** Mês máximo liberado (AAAA-MM) vindo da configuração ou .env. */
export function getReleasedUntil(escalaLiberadaAte?: string): MesRef | null {
  return resolveReleaseLimit(escalaLiberadaAte)
}

export function isMonthReleased(
  ano: number,
  mes: number,
  adminMode: boolean,
  escalaLiberadaAte?: string,
): boolean {
  if (adminMode) return true

  const limit = getReleasedUntil(escalaLiberadaAte)
  if (!limit) return true

  return compareMes({ ano, mes }, limit) <= 0
}

export function isEscalaReleased(
  escala: EscalaMes,
  adminMode: boolean,
  escalaLiberadaAte?: string,
): boolean {
  return isMonthReleased(escala.ano, escala.mes, adminMode, escalaLiberadaAte)
}

export function filterReleasedEscalas(
  escalas: EscalaMes[],
  adminMode: boolean,
  escalaLiberadaAte?: string,
): EscalaMes[] {
  return escalas.filter((e) => isEscalaReleased(e, adminMode, escalaLiberadaAte))
}

export function getReleaseHint(escalaLiberadaAte?: string): string | null {
  const limit = getReleasedUntil(escalaLiberadaAte)
  if (!limit) return null
  return formatMesAno(limit.ano, limit.mes)
}
