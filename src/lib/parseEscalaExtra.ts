import type { PlantaoDia, PlantaoExtraMes, PlantaoPeriodo, ServicoExtra } from '../types'
import { formatMesAno } from './mesRef'

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

function parseMinistros(raw: string): string[] {
  return raw
    .split(/[/|]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function detectHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    if (isEmptyRow(row)) continue
    const joined = row.join(' ').toLowerCase()
    if (joined.includes('mesc') && joined.includes('data')) {
      return i
    }
    if (joined.includes('mesc') && joined.includes('dia')) {
      return i
    }
  }
  return 0
}

function detectServicosHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    if (isEmptyRow(row)) continue
    const joined = row.join(' ').toLowerCase()
    if (joined.includes('evento')) {
      return i
    }
  }
  return 0
}

type ServicoColumnMapping = {
  data: number
  tipo: number
  evento: number
  horario: number
  local: number
  responsavel: number
  telefone: number
  observacao: number
}

function findColumnIndex(headerRow: string[], labels: string[]): number {
  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i]?.trim().toLowerCase() ?? ''
    if (labels.some((label) => cell === label || cell.includes(label))) {
      return i
    }
  }
  return -1
}

function buildServicoColumnMapping(headerRow: string[]): ServicoColumnMapping {
  const tipo = findColumnIndex(headerRow, ['tipo'])
  const evento = findColumnIndex(headerRow, ['evento'])
  const hasTipo = tipo >= 0

  return {
    data: findColumnIndex(headerRow, ['data']) >= 0 ? findColumnIndex(headerRow, ['data']) : 0,
    tipo,
    evento: evento >= 0 ? evento : hasTipo ? 2 : 1,
    horario: findColumnIndex(headerRow, ['horário', 'horario']) >= 0
      ? findColumnIndex(headerRow, ['horário', 'horario'])
      : hasTipo ? 3 : 2,
    local: findColumnIndex(headerRow, ['local']) >= 0
      ? findColumnIndex(headerRow, ['local'])
      : hasTipo ? 4 : 3,
    responsavel: findColumnIndex(headerRow, ['responsável', 'responsavel']) >= 0
      ? findColumnIndex(headerRow, ['responsável', 'responsavel'])
      : hasTipo ? 5 : 4,
    telefone: findColumnIndex(headerRow, ['telefone', 'tel']) >= 0
      ? findColumnIndex(headerRow, ['telefone', 'tel'])
      : hasTipo ? 6 : 5,
    observacao: findColumnIndex(headerRow, ['observação', 'observacao', 'obs']) >= 0
      ? findColumnIndex(headerRow, ['observação', 'observacao', 'obs'])
      : hasTipo ? 7 : 6,
  }
}

function parseServicoRow(row: string[], cols: ServicoColumnMapping): ServicoExtra | null {
  const evento = pick(row, cols.evento)
  if (!evento) return null

  return {
    tipo: cols.tipo >= 0 ? pick(row, cols.tipo) : '',
    evento,
    horario: pick(row, cols.horario),
    local: pick(row, cols.local),
    responsavel: pick(row, cols.responsavel),
    telefone: pick(row, cols.telefone),
    observacao: pick(row, cols.observacao),
  }
}

export function parseServicosFromRows(rawRows: string[][]): Map<string, ServicoExtra[]> {
  const rows = rawRows.filter((row) => !isEmptyRow(row))
  if (rows.length < 2) return new Map()

  const headerRowIndex = detectServicosHeaderRow(rows)
  const headerRow = rows[headerRowIndex] ?? []
  const cols = buildServicoColumnMapping(headerRow)
  const dataRows = rows.slice(headerRowIndex + 1)
  const porData = new Map<string, ServicoExtra[]>()

  for (const row of dataRows) {
    const dataISO = parseDataISO(pick(row, cols.data))
    if (!dataISO) continue

    const servico = parseServicoRow(row, cols)
    if (!servico) continue

    const bucket = porData.get(dataISO) ?? []
    bucket.push(servico)
    porData.set(dataISO, bucket)
  }

  return porData
}

export function isSemEventoExtra(evento: string): boolean {
  const normalized = evento.trim().toLowerCase()
  return (
    normalized === 'sem evento extra' ||
    normalized === 'sem evento' ||
    normalized === '—' ||
    normalized === '-'
  )
}

function attachServicos(
  dias: PlantaoDia[],
  servicosPorData: Map<string, ServicoExtra[]>,
): PlantaoDia[] {
  return dias.map((dia) => ({
    ...dia,
    servicos: servicosPorData.get(dia.dataISO) ?? [],
  }))
}

function isNextDay(prevISO: string, nextISO: string): boolean {
  const prev = new Date(`${prevISO}T12:00:00`)
  prev.setDate(prev.getDate() + 1)
  return prev.toISOString().slice(0, 10) === nextISO
}

export function groupPlantaoPeriodos(dias: PlantaoDia[]): PlantaoPeriodo[] {
  const sorted = [...dias].sort((a, b) => a.dataISO.localeCompare(b.dataISO))
  const periodos: PlantaoPeriodo[] = []

  for (const dia of sorted) {
    const key = dia.ministros.join('|')
    const last = periodos[periodos.length - 1]

    if (last && last.ministros.join('|') === key) {
      const lastDia = last.dias[last.dias.length - 1]
      if (isNextDay(lastDia.dataISO, dia.dataISO)) {
        last.dias.push(dia)
        last.fimISO = dia.dataISO
        last.labelFim = dia.dataLabel
        continue
      }
    }

    periodos.push({
      inicioISO: dia.dataISO,
      fimISO: dia.dataISO,
      labelInicio: dia.dataLabel,
      labelFim: dia.dataLabel,
      dias: [dia],
      ministros: dia.ministros,
    })
  }

  return periodos
}

function buildPlantaoMesFromDias(dias: PlantaoDia[]): PlantaoExtraMes | null {
  if (dias.length === 0) return null

  const first = dias[0]
  const [anoStr, mesStr] = first.dataISO.split('-')
  const mes = Number(mesStr)
  const ano = Number(anoStr)

  const sorted = [...dias].sort((a, b) => a.dataISO.localeCompare(b.dataISO))

  return {
    mesAno: `${MESES[mes - 1] ?? ''} ${ano}`.trim(),
    mes,
    ano,
    dias: sorted,
    periodos: groupPlantaoPeriodos(sorted),
  }
}

function parseDiasFromRows(rawRows: string[][]): PlantaoDia[] {
  const rows = rawRows.filter((row) => !isEmptyRow(row))
  if (rows.length < 2) return []

  const headerRowIndex = detectHeaderRow(rows)
  const dataRows = rows.slice(headerRowIndex + 1)
  const dias: PlantaoDia[] = []

  for (const row of dataRows) {
    const dataRaw = pick(row, 0)
    const dataISO = parseDataISO(dataRaw)
    if (!dataISO) continue

    const ministros = parseMinistros(pick(row, 2))
    if (ministros.length === 0) continue

    dias.push({
      dataISO,
      dataLabel: formatDataLabel(dataISO),
      diaSemana: pick(row, 1),
      diaNumero: Number(formatDataLabel(dataISO)),
      ministros,
      servicos: [],
    })
  }

  return dias
}

export function parsePlantaoExtraAll(
  rawRows: string[][],
  servicoRows?: string[][],
): PlantaoExtraMes[] {
  const servicosPorData = servicoRows?.length
    ? parseServicosFromRows(servicoRows)
    : new Map<string, ServicoExtra[]>()
  const dias = attachServicos(parseDiasFromRows(rawRows), servicosPorData)
  if (dias.length === 0) return []

  const porMes = new Map<string, PlantaoDia[]>()

  for (const dia of dias) {
    const key = dia.dataISO.slice(0, 7)
    const bucket = porMes.get(key) ?? []
    bucket.push(dia)
    porMes.set(key, bucket)
  }

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, monthDias]) => buildPlantaoMesFromDias(monthDias))
    .filter((item): item is PlantaoExtraMes => item !== null)
}

export function filterPlantaoExtraMes(
  plantao: PlantaoExtraMes,
  search: string,
  dateFilter: string | null = null,
): PlantaoExtraMes {
  const term = search.trim().toLowerCase()

  let periodos = plantao.periodos

  if (term) {
    periodos = periodos.filter((periodo) => {
    const blob = [
      ...periodo.ministros,
      ...periodo.dias.map((d) => d.diaSemana),
      ...periodo.dias.flatMap((d) =>
        d.servicos.flatMap((s) => [
          s.tipo,
          s.evento,
          s.horario,
          s.local,
          s.responsavel,
          s.observacao,
        ]),
      ),
    ]
      .join(' ')
      .toLowerCase()
    return blob.includes(term)
    })
  }

  if (dateFilter) {
    periodos = periodos
      .filter((periodo) => periodo.dias.some((d) => d.dataISO === dateFilter))
      .map((periodo) => ({
        ...periodo,
        dias: periodo.dias.filter((d) => d.dataISO === dateFilter),
      }))
  }

  const dias = periodos.flatMap((p) => p.dias)

  return {
    ...plantao,
    dias,
    periodos,
  }
}

export function formatDiaSemanaCurto(diaSemana: string): string {
  const base = diaSemana.trim().split(/[-\s/]/)[0] ?? diaSemana
  if (!base) return ''
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase()
}

export function formatPeriodoDescricao(
  periodo: PlantaoPeriodo,
  mes: number,
): string {
  const mesNome = MESES[mes - 1]?.toLowerCase() ?? ''
  const dias = periodo.dias
  if (dias.length === 0) return ''

  if (dias.length === 1) {
    const dia = dias[0]
    return `${formatDiaSemanaCurto(dia.diaSemana)}, ${dia.diaNumero} de ${mesNome}`
  }

  const semanas = dias.map((d) => formatDiaSemanaCurto(d.diaSemana).toLowerCase())
  const nums = dias.map((d) => d.diaNumero)

  if (nums.length === 2) {
    return `${semanas[0]} e ${semanas[1]}, ${nums[0]} e ${nums[1]} de ${mesNome}`
  }

  return `${nums[0]} a ${nums[nums.length - 1]} de ${mesNome}`
}

export function formatPeriodoLabel(periodo: PlantaoPeriodo, mes: number): string {
  return formatPeriodoDescricao(periodo, mes)
}

export function findPlantaoPeriodoHoje(
  plantao: PlantaoExtraMes,
  todayISO: string,
): PlantaoPeriodo | null {
  return plantao.periodos.find((p) =>
    p.dias.some((d) => d.dataISO === todayISO),
  ) ?? null
}

export function formatMesAnoPlantao(plantao: PlantaoExtraMes): string {
  return formatMesAno(plantao.ano, plantao.mes)
}
