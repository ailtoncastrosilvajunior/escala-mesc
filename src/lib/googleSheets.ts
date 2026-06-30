export interface GvizCell {
  v: string | number | null
  f?: string
}

export interface GvizRow {
  c: Array<GvizCell | null>
}

export interface GvizTable {
  cols: Array<{ label: string; type: string }>
  rows: GvizRow[]
}

export interface GvizResponse {
  table: GvizTable
}

function cellValue(cell: GvizCell | null | undefined): string {
  if (!cell) return ''
  if (cell.f != null && cell.f !== '') return String(cell.f)
  if (cell.v == null) return ''
  return String(cell.v)
}

function parseGvizPayload(text: string): GvizResponse {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/)
  if (!match) {
    throw new Error('Resposta inválida do Google Sheets. Verifique se a planilha está pública.')
  }
  return JSON.parse(match[1]) as GvizResponse
}

export async function fetchSheetRows(
  spreadsheetId: string,
  sheetName: string,
): Promise<{ headers: string[]; rows: string[][] }> {
  const id = spreadsheetId.trim()
  if (!id) {
    throw new Error('Informe o ID da planilha do Google Drive.')
  }

  const params = new URLSearchParams({
    tqx: 'out:json',
    headers: '0',
    sheet: sheetName.trim() || 'Escala',
  })

  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Não foi possível acessar a planilha (${response.status}). Confira o ID, o nome da aba e se ela está compartilhada como "Qualquer pessoa com o link pode ver".`,
    )
  }

  const text = await response.text()
  const data = parseGvizPayload(text)

  if (!data.table?.rows?.length) {
    return { headers: [], rows: [] }
  }

  const rows = data.table.rows.map((row) =>
    row.c.map((cell) => cellValue(cell)),
  )

  return { headers: rows[0] ?? [], rows }
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim()

  const fromUrl = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (fromUrl) return fromUrl[1]

  return trimmed
}
