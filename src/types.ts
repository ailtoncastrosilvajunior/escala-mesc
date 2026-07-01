export interface ColumnNames {
  data?: string
  diaSemana?: string
  horario?: string
  evento?: string
  funcao?: string
  servo?: string
  observacao?: string
}

export interface SheetConfig {
  spreadsheetId: string
  sheetName: string
  /** Nome da aba de escala extra (plantão). Vazio = aba desativada. */
  extraSheetName?: string
  /** Nome da aba de serviços extra. Vazio = aba desativada. */
  extraServicosSheetName?: string
  titulo: string
  subtitulo: string
  periodo: string
  coordenacao: string
  /** Linha do cabeçalho na planilha (1 = primeira linha). Vazio = detecção automática. */
  headerRow?: number
  /** Nomes exatos ou parciais das colunas na planilha. Vazio = detecção automática. */
  columns?: ColumnNames
  /** Mês máximo visível para usuários (AAAA-MM). Vazio = todos liberados. */
  escalaLiberadaAte?: string
}

export interface EscalaLinha {
  data: string
  diaSemana: string
  horario: string
  evento: string
  funcao: string
  servo: string
  observacao: string
}

export interface EscalaPorData {
  data: string
  diaSemana: string
  horario: string
  evento: string
  escalados: Array<{
    funcao: string
    servo: string
    observacao: string
  }>
}

export interface MappingEntry {
  field: keyof ColumnMapping
  label: string
  columnIndex: number
  headerName: string
}

export interface ParseStats {
  rawRows: number
  dataRows: number
  parsedRows: number
  skippedRows: number
}

export interface ParsedEscala {
  linhas: EscalaLinha[]
  porData: EscalaPorData[]
  headers: string[]
  rawRows: string[][]
  headerRow: number
  mapping: ColumnMapping
  mappingEntries: MappingEntry[]
  stats: ParseStats
}

export type ColumnMapping = {
  data: number
  diaSemana: number
  horario: number
  evento: number
  funcao: number
  servo: number
  observacao: number
}

export const COLUMN_FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  data: 'Data',
  diaSemana: 'Dia',
  horario: 'Horário',
  evento: 'Evento',
  funcao: 'Função',
  servo: 'Servo',
  observacao: 'Observação',
}

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  data: 0,
  diaSemana: 1,
  horario: 2,
  evento: 3,
  funcao: 4,
  servo: 5,
  observacao: 6,
}

export const DEFAULT_SHEET_CONFIG: SheetConfig = {
  spreadsheetId: '',
  sheetName: 'Escala',
  extraSheetName: 'Escala Extra',
  extraServicosSheetName: 'Serviços Extra',
  titulo: 'Demonstrativo · Escala MESC',
  subtitulo: 'Ministério de Escalas · Comunidade',
  periodo: '',
  coordenacao: '',
}

export type AppView =
  | 'escala-mes'
  | 'plantao-extra'
  | 'demonstrativo'
  | 'planilha'
  | 'configuracao'

export interface ServicoExtra {
  tipo: string
  evento: string
  horario: string
  local: string
  responsavel: string
  telefone: string
  observacao: string
}

export interface PlantaoDia {
  dataISO: string
  dataLabel: string
  diaSemana: string
  diaNumero: number
  ministros: string[]
  servicos: ServicoExtra[]
}

export interface PlantaoPeriodo {
  inicioISO: string
  fimISO: string
  labelInicio: string
  labelFim: string
  dias: PlantaoDia[]
  ministros: string[]
}

export interface PlantaoExtraMes {
  mesAno: string
  mes: number
  ano: number
  dias: PlantaoDia[]
  periodos: PlantaoPeriodo[]
}

export interface MissaEvent {
  id: string
  dataISO: string
  dataLabel: string
  diaSemana: string
  horario: string
  celebrante: string
  acolhimento: string
  comentarista: string
  procPalavra: string
  oracaoFieis: string
  mesc: string
  adoracao: string
  observacoes: string
}

export interface DiaEscala {
  dataISO: string
  dataLabel: string
  diaSemana: string
  diaNumero: number
  missas: MissaEvent[]
}

export interface EscalaMes {
  mesAno: string
  mes: number
  ano: number
  dias: DiaEscala[]
  horarios: string[]
  totalMissas: number
}

export interface RoleDefinition {
  key: keyof Omit<
    MissaEvent,
    'id' | 'dataISO' | 'dataLabel' | 'diaSemana' | 'horario'
  >
  label: string
  shortLabel: string
  accent: string
}

export const MESC_ROLES: RoleDefinition[] = [
  { key: 'celebrante', label: 'Celebrante', shortLabel: 'Celebr.', accent: '#d4a853' },
  { key: 'acolhimento', label: 'Acolhimento', shortLabel: 'Acolh.', accent: '#6eb5ff' },
  { key: 'comentarista', label: 'Comentarista', shortLabel: 'Coment.', accent: '#a78bfa' },
  { key: 'procPalavra', label: 'Proc. Palavra', shortLabel: 'Palavra', accent: '#34d399' },
  { key: 'oracaoFieis', label: 'Oração dos Fiéis', shortLabel: 'Oração', accent: '#f472b6' },
  { key: 'mesc', label: 'MESC', shortLabel: 'MESC', accent: '#2dd4bf' },
  { key: 'adoracao', label: 'Adoração', shortLabel: 'Ador.', accent: '#fb923c' },
]
