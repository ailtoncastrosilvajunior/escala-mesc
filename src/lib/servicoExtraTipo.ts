export type ServicoTipoKey =
  | 'adoracao'
  | 'casamento'
  | 'missa-7-dia'
  | 'outro'

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
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
