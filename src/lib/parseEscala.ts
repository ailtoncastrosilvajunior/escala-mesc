import type {
  ColumnMapping,
  ColumnNames,
  EscalaLinha,
  EscalaPorData,
  MappingEntry,
  ParsedEscala,
  ParseStats,
  SheetConfig,
} from '../types'
import {
  COLUMN_FIELD_LABELS,
  DEFAULT_COLUMN_MAPPING,
} from '../types'

function pick(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return ''
  return (row[index] ?? '').trim()
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => !cell?.trim())
}

const HEADER_TERMS: Record<keyof ColumnMapping, string[]> = {
  data: ['data'],
  diaSemana: ['dia'],
  horario: ['horário', 'horario', 'hora'],
  evento: ['evento', 'culto', 'missa', 'atividade'],
  funcao: ['função', 'funcao', 'ministério', 'ministerio', 'papel'],
  servo: ['servo', 'nome', 'voluntário', 'voluntario', 'responsável', 'responsavel'],
  observacao: ['obs', 'observação', 'observacao', 'nota'],
}

function rowHeaderScore(row: string[]): number {
  const lower = row.map((cell) => cell.toLowerCase().trim())
  let score = 0

  for (const terms of Object.values(HEADER_TERMS)) {
    if (lower.some((cell) => terms.some((term) => cell.includes(term)))) {
      score += 1
    }
  }

  return score
}

export function detectHeaderRow(rows: string[][]): number {
  const limit = Math.min(rows.length, 20)
  let bestIndex = 0
  let bestScore = -1

  for (let i = 0; i < limit; i++) {
    const row = rows[i]
    if (isEmptyRow(row)) continue

    const score = rowHeaderScore(row)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestScore > 0 ? bestIndex : 0
}

function findColumnByName(headers: string[], name: string): number {
  const target = name.toLowerCase().trim()
  const exact = headers.findIndex((h) => h.toLowerCase().trim() === target)
  if (exact >= 0) return exact

  return headers.findIndex((h) => h.toLowerCase().trim().includes(target))
}

function findColumnByTerms(headers: string[], terms: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim())
  return lower.findIndex((h) => terms.some((term) => h.includes(term)))
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = { ...DEFAULT_COLUMN_MAPPING }

  for (const field of Object.keys(HEADER_TERMS) as Array<keyof ColumnMapping>) {
    const index = findColumnByTerms(headers, HEADER_TERMS[field])
    if (index >= 0) mapping[field] = index
  }

  return mapping
}

export function resolveColumnMapping(
  headers: string[],
  columnNames?: ColumnNames,
): ColumnMapping {
  if (!columnNames || Object.keys(columnNames).length === 0) {
    return detectColumnMapping(headers)
  }

  const mapping = detectColumnMapping(headers)

  for (const field of Object.keys(columnNames) as Array<keyof ColumnNames>) {
    const name = columnNames[field]?.trim()
    if (!name) continue

    const index = findColumnByName(headers, name)
    if (index >= 0) {
      mapping[field as keyof ColumnMapping] = index
    }
  }

  return mapping
}

export function buildMappingEntries(
  headers: string[],
  mapping: ColumnMapping,
): MappingEntry[] {
  return (Object.keys(COLUMN_FIELD_LABELS) as Array<keyof ColumnMapping>).map(
    (field) => ({
      field,
      label: COLUMN_FIELD_LABELS[field],
      columnIndex: mapping[field],
      headerName: headers[mapping[field]]?.trim() || '(coluna vazia)',
    }),
  )
}

function groupByDate(linhas: EscalaLinha[]): EscalaPorData[] {
  const map = new Map<string, EscalaPorData>()

  for (const linha of linhas) {
    const key = `${linha.data}|${linha.horario}|${linha.evento}`
    const existing = map.get(key)

    if (existing) {
      existing.escalados.push({
        funcao: linha.funcao,
        servo: linha.servo,
        observacao: linha.observacao,
      })
      continue
    }

    map.set(key, {
      data: linha.data,
      diaSemana: linha.diaSemana,
      horario: linha.horario,
      evento: linha.evento,
      escalados: [
        {
          funcao: linha.funcao,
          servo: linha.servo,
          observacao: linha.observacao,
        },
      ],
    })
  }

  return Array.from(map.values())
}

export function parseEscala(
  rawRows: string[][],
  config: Pick<SheetConfig, 'headerRow' | 'columns'> = {},
): ParsedEscala {
  const nonEmptyRows = rawRows.filter((row) => !isEmptyRow(row))
  const headerRowIndex =
    config.headerRow && config.headerRow > 0
      ? config.headerRow - 1
      : detectHeaderRow(nonEmptyRows)

  const headers = nonEmptyRows[headerRowIndex] ?? []
  const dataRows = nonEmptyRows.slice(headerRowIndex + 1)
  const mapping = resolveColumnMapping(headers, config.columns)

  const linhas: EscalaLinha[] = []
  let skippedRows = 0

  for (const row of dataRows) {
    const parsed: EscalaLinha = {
      data: pick(row, mapping.data),
      diaSemana: pick(row, mapping.diaSemana),
      horario: pick(row, mapping.horario),
      evento: pick(row, mapping.evento),
      funcao: pick(row, mapping.funcao),
      servo: pick(row, mapping.servo),
      observacao: pick(row, mapping.observacao),
    }

    if (!parsed.data && !parsed.servo && !parsed.funcao && !parsed.evento) {
      skippedRows += 1
      continue
    }

    linhas.push(parsed)
  }

  const stats: ParseStats = {
    rawRows: rawRows.length,
    dataRows: dataRows.length,
    parsedRows: linhas.length,
    skippedRows,
  }

  return {
    linhas,
    porData: groupByDate(linhas),
    headers,
    rawRows: nonEmptyRows,
    headerRow: headerRowIndex + 1,
    mapping,
    mappingEntries: buildMappingEntries(headers, mapping),
    stats,
  }
}

export function inferPeriodo(linhas: EscalaLinha[]): string {
  const datas = linhas
    .map((l) => l.data)
    .filter(Boolean)
    .sort()

  if (datas.length === 0) return ''

  const first = datas[0]
  const last = datas[datas.length - 1]

  if (first === last) return first
  return `${first} — ${last}`
}
