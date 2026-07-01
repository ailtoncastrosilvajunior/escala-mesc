export type ServicoTipoKey =
  | 'adoracao'
  | 'casamento'
  | 'missa-7-dia'
  | 'outro'

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
}

function normalizeText(value: string): string {
  return stripAccents(value.trim().toLowerCase())
}

/** Título do evento sem repetir o que já está no badge de tipo. */
export function servicoEventoTitulo(evento: string, tipo: string): string | null {
  const eventoTrim = evento.trim()
  if (!eventoTrim) return null

  const tipoTrim = tipo.trim()
  if (!tipoTrim) return eventoTrim

  const eventoNorm = normalizeText(eventoTrim)
  const tipoNorm = normalizeText(tipoTrim)

  if (eventoNorm === tipoNorm) return null

  if (eventoNorm.startsWith(tipoNorm)) {
    const rest = eventoTrim
      .slice(tipoTrim.length)
      .trim()
      .replace(/^[·\-–—:\s]+/, '')
    return rest || null
  }

  return eventoTrim
}

export function normalizeServicoTipo(tipo: string): ServicoTipoKey {
  const normalized = stripAccents(tipo.trim().toLowerCase())
  if (!normalized) return 'outro'
  if (normalized.includes('adoracao')) return 'adoracao'
  if (normalized.includes('casamento')) return 'casamento'
  if (normalized.includes('missa') && normalized.includes('7')) return 'missa-7-dia'
  return 'outro'
}

export function servicoTipoClassName(tipo: string): string {
  return `extra-servico__tipo--${normalizeServicoTipo(tipo)}`
}

export function servicoTipoBorderClass(tipo: string): string {
  const key = normalizeServicoTipo(tipo)
  return key === 'outro' ? '' : `extra-servico--tipo-${key}`
}
