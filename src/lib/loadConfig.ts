import type { SheetConfig } from '../types'
import { DEFAULT_SHEET_CONFIG } from '../types'
import { parseMesKey } from './mesRef'
import { extractSpreadsheetId } from './googleSheets'

const LOCAL_STORAGE_KEY = 'escala-mesc-config'

function envValue(key: string): string | undefined {
  const value = import.meta.env[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function envOverrides(): Partial<SheetConfig> {
  const overrides: Partial<SheetConfig> = {}

  const spreadsheetId = envValue('VITE_SPREADSHEET_ID')
  const sheetName = envValue('VITE_SHEET_NAME')
  const titulo = envValue('VITE_TITULO')
  const subtitulo = envValue('VITE_SUBTITULO')
  const periodo = envValue('VITE_PERIODO')
  const coordenacao = envValue('VITE_COORDENACAO')
  const escalaLiberadaAte = envValue('VITE_ESCALA_LIBERADA_ATE')

  if (spreadsheetId) overrides.spreadsheetId = spreadsheetId
  if (sheetName) overrides.sheetName = sheetName
  if (titulo) overrides.titulo = titulo
  if (subtitulo) overrides.subtitulo = subtitulo
  if (periodo) overrides.periodo = periodo
  if (coordenacao) overrides.coordenacao = coordenacao
  if (escalaLiberadaAte) overrides.escalaLiberadaAte = escalaLiberadaAte

  return overrides
}

function normalizeConfig(raw: Partial<SheetConfig>): SheetConfig {
  const spreadsheetId = raw.spreadsheetId
    ? extractSpreadsheetId(raw.spreadsheetId)
    : ''

  const headerRow =
    typeof raw.headerRow === 'number' && raw.headerRow > 0
      ? raw.headerRow
      : undefined

  const columns = raw.columns
    ? Object.fromEntries(
        Object.entries(raw.columns).filter(([, value]) => value?.trim()),
      )
    : undefined

  const escalaLiberadaAte = normalizeEscalaLiberadaAte(raw.escalaLiberadaAte)

  return {
    ...DEFAULT_SHEET_CONFIG,
    ...raw,
    spreadsheetId,
    sheetName: raw.sheetName?.trim() || DEFAULT_SHEET_CONFIG.sheetName,
    headerRow,
    columns: columns && Object.keys(columns).length > 0 ? columns : undefined,
    escalaLiberadaAte,
  }
}

function normalizeEscalaLiberadaAte(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined
  const trimmed = raw.trim()
  return parseMesKey(trimmed) ? trimmed : undefined
}

function readLocalConfig(): Partial<SheetConfig> | null {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!saved) return null

  try {
    return JSON.parse(saved) as Partial<SheetConfig>
  } catch {
    return null
  }
}

export async function fetchFileConfig(): Promise<Partial<SheetConfig>> {
  try {
    const response = await fetch('/config.json', { cache: 'no-cache' })
    if (!response.ok) return {}
    return (await response.json()) as Partial<SheetConfig>
  } catch {
    return {}
  }
}

export async function loadAppConfig(): Promise<{
  config: SheetConfig
  sources: string[]
}> {
  const sources: string[] = ['padrões']
  const fileConfig = await fetchFileConfig()

  if (Object.keys(fileConfig).length > 0) {
    sources.push('config.json')
  }

  let merged: SheetConfig = normalizeConfig({
    ...DEFAULT_SHEET_CONFIG,
    ...fileConfig,
  })

  const env = envOverrides()
  if (Object.keys(env).length > 0) {
    merged = normalizeConfig({ ...merged, ...env })
    sources.push('.env')
  }

  const local = readLocalConfig()
  if (local) {
    merged = normalizeConfig({ ...merged, ...local })
    sources.push('navegador (salvo)')
  }

  return { config: merged, sources }
}

export function saveLocalConfig(config: SheetConfig): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config))
}

export function downloadConfigFile(config: SheetConfig): void {
  const payload = JSON.stringify(config, null, 2)
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'config.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function getConfigSourceHint(sources: string[]): string {
  return `Carregado de: ${sources.join(' → ')}`
}
