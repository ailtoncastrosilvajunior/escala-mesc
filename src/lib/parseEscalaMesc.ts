import type { DiaEscala, EscalaMes, MissaEvent } from '../types'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function pick(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return ''
  return (row[index] ?? '').trim()
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => !cell?.trim())
}

export function isMescSheetFormat(headers: string[]): boolean {
  const joined = headers.join(' ').toLowerCase()
  return joined.includes('mesc') || joined.includes('celebrante')
}

function parseDataISO(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const br = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (br) {
    const [, d, m, y] = br
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return trimmed

  return null
}

function formatDataLabel(iso: string): string {
  const [, , d] = iso.split('-')
  return d.replace(/^0/, '')
}

function normalizeHorario(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  const match = trimmed.match(/(\d{1,2}):(\d{2})/)
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`
  }

  return trimmed
}

function horarioSortKey(horario: string): number {
  const match = horario.match(/(\d{1,2}):(\d{2})/)
  if (!match) return 9999
  return Number(match[1]) * 60 + Number(match[2])
}

function detectMescHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    if (isEmptyRow(row)) continue
    const joined = row.join(' ').toLowerCase()
    if (joined.includes('celebrante') || joined.includes('mesc')) {
      return i
    }
  }
  return 0
}

function buildEscalaMesFromEventos(eventos: MissaEvent[]): EscalaMes | null {
  if (eventos.length === 0) return null

  const first = eventos[0]
  const [anoStr, mesStr] = first.dataISO.split('-')
  const mes = Number(mesStr)
  const ano = Number(anoStr)

  const porDia = new Map<string, DiaEscala>()

  for (const missa of eventos) {
    const existing = porDia.get(missa.dataISO)
    if (existing) {
      existing.missas.push(missa)
      existing.missas.sort(
        (a, b) => horarioSortKey(a.horario) - horarioSortKey(b.horario),
      )
      continue
    }

    porDia.set(missa.dataISO, {
      dataISO: missa.dataISO,
      dataLabel: missa.dataLabel,
      diaSemana: missa.diaSemana,
      diaNumero: Number(missa.dataLabel),
      missas: [missa],
    })
  }

  const dias = Array.from(porDia.values()).sort((a, b) =>
    a.dataISO.localeCompare(b.dataISO),
  )

  const horarios = [...new Set(eventos.map((e) => e.horario).filter(Boolean))]
    .sort((a, b) => horarioSortKey(a) - horarioSortKey(b))

  return buildMescView({
    mesAno: `${MESES[mes - 1] ?? ''} ${ano}`.trim(),
    mes,
    ano,
    dias,
    horarios,
    totalMissas: eventos.length,
  })
}

function parseEventosFromRows(rawRows: string[][]): MissaEvent[] {
  const rows = rawRows.filter((row) => !isEmptyRow(row))
  if (rows.length < 2) return []

  const headerRowIndex = detectMescHeaderRow(rows)
  const dataRows = rows.slice(headerRowIndex + 1)
  const eventos: MissaEvent[] = []

  for (const row of dataRows) {
    const dataRaw = pick(row, 0)
    const dataISO = parseDataISO(dataRaw)
    if (!dataISO) continue

    const horario = normalizeHorario(pick(row, 2))
    eventos.push({
      id: `${dataISO}-${horario}-${eventos.length}`,
      dataISO,
      dataLabel: formatDataLabel(dataISO),
      diaSemana: pick(row, 1),
      horario,
      celebrante: pick(row, 3),
      acolhimento: pick(row, 4),
      comentarista: pick(row, 5),
      procPalavra: pick(row, 6),
      oracaoFieis: pick(row, 7),
      mesc: pick(row, 8),
      adoracao: pick(row, 9),
      observacoes: pick(row, 10),
    })
  }

  return eventos
}

/** Todas as escalas MESC da planilha, uma entrada por mês (ordenado cronologicamente). */
export function parseEscalaMescAll(rawRows: string[][]): EscalaMes[] {
  const eventos = parseEventosFromRows(rawRows)
  if (eventos.length === 0) return []

  const porMes = new Map<string, MissaEvent[]>()

  for (const evento of eventos) {
    const key = evento.dataISO.slice(0, 7)
    const bucket = porMes.get(key) ?? []
    bucket.push(evento)
    porMes.set(key, bucket)
  }

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, monthEvents]) => buildEscalaMesFromEventos(monthEvents))
    .filter((e): e is EscalaMes => e !== null)
}

export function parseEscalaMesc(rawRows: string[][]): EscalaMes | null {
  const all = parseEscalaMescAll(rawRows)
  return all[all.length - 1] ?? null
}

/** Mantém só missas com MESC escalado e horários presentes na escala. */
export function buildMescView(escala: EscalaMes): EscalaMes {
  const dias = escala.dias
    .map((dia) => ({
      ...dia,
      missas: dia.missas.filter((m) => m.mesc.trim()),
    }))
    .filter((dia) => dia.missas.length > 0)

  const horarios = [
    ...new Set(dias.flatMap((d) => d.missas.map((m) => m.horario).filter(Boolean))),
  ].sort((a, b) => horarioSortKey(a) - horarioSortKey(b))

  return {
    ...escala,
    dias,
    horarios,
    totalMissas: dias.reduce((sum, d) => sum + d.missas.length, 0),
  }
}

/** Horários que aparecem na escala filtrada (busca e/ou dia), sem filtro de horário. */
export function horariosComOcorrencia(
  escala: EscalaMes,
  search = '',
  dateFilter: string | null = null,
): string[] {
  const filtered = filterEscalaMes(escala, null, search, dateFilter)
  return [
    ...new Set(
      filtered.dias.flatMap((d) => d.missas.map((m) => m.horario).filter(Boolean)),
    ),
  ].sort((a, b) => horarioSortKey(a) - horarioSortKey(b))
}

export function filterEscalaMes(
  escala: EscalaMes,
  horarioFilter: string | null,
  search: string,
  dateFilter: string | null = null,
): EscalaMes {
  const term = search.trim().toLowerCase()

  const dias = escala.dias
    .filter((dia) => !dateFilter || dia.dataISO === dateFilter)
    .map((dia) => {
      const missas = dia.missas.filter((missa) => {
        if (horarioFilter && missa.horario !== horarioFilter) return false
        if (!term) return true

        const blob = [
          missa.mesc,
          missa.adoracao,
          missa.celebrante,
          missa.observacoes,
          missa.diaSemana,
          missa.horario,
        ]
          .join(' ')
          .toLowerCase()

        return blob.includes(term)
      })

      return missas.length > 0 ? { ...dia, missas } : null
    })
    .filter((dia): dia is DiaEscala => dia !== null)

  return {
    ...escala,
    dias,
    totalMissas: dias.reduce((sum, d) => sum + d.missas.length, 0),
  }
}

export function horarioLabel(horario: string): string {
  if (!horario) return '—'
  if (horario.endsWith('h')) return horario
  return `${horario}h`
}
