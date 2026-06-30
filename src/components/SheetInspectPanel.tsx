import type { ParsedEscala } from '../types'

interface Props {
  escala: ParsedEscala | null
  sheetName: string
}

const PREVIEW_ROWS = 25

export function SheetInspectPanel({ escala, sheetName }: Props) {
  if (!escala) {
    return (
      <section className="panel">
        <h2>Leitura da planilha</h2>
        <p className="panel-hint">
          Clique em «Reler planilha» para buscar os dados atuais da aba «{sheetName}».
        </p>
      </section>
    )
  }

  const previewRows = escala.rawRows.slice(0, PREVIEW_ROWS)
  const maxCols = Math.max(
    ...previewRows.map((row) => row.length),
    escala.headers.length,
    1,
  )

  return (
    <div className="sheet-inspect">
      <section className="panel">
        <h2>Como o app entende a planilha</h2>
        <div className="inspect-stats">
          <div className="stat-card">
            <span className="stat-value">{escala.stats.rawRows}</span>
            <span className="stat-label">linhas lidas</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">Linha {escala.headerRow}</span>
            <span className="stat-label">cabeçalho detectado</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{escala.stats.parsedRows}</span>
            <span className="stat-label">registros interpretados</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{escala.stats.skippedRows}</span>
            <span className="stat-label">linhas ignoradas</span>
          </div>
        </div>

        {escala.stats.parsedRows === 0 && (
          <div className="alert alert-warn" role="status">
            Nenhum registro foi interpretado. Confira o mapeamento abaixo ou ajuste
            a linha do cabeçalho / nomes das colunas em Configuração.
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Mapeamento de colunas</h2>
        <p className="panel-hint">
          Cada campo do demonstrativo vem de uma coluna da planilha. Se algo estiver
          errado, defina os nomes manualmente em Configuração.
        </p>
        <table className="data-table mapping-table">
          <thead>
            <tr>
              <th>Campo no app</th>
              <th>Coluna #</th>
              <th>Cabeçalho na planilha</th>
            </tr>
          </thead>
          <tbody>
            {escala.mappingEntries.map((entry) => (
              <tr
                key={entry.field}
                className={entry.headerName === '(coluna vazia)' ? 'row-warn' : ''}
              >
                <td>{entry.label}</td>
                <td>{entry.columnIndex + 1}</td>
                <td>{entry.headerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Planilha bruta (primeiras {PREVIEW_ROWS} linhas)</h2>
        <p className="panel-hint">
          Linha <strong>{escala.headerRow}</strong> destacada = cabeçalho usado pelo app.
        </p>
        <div className="table-wrap">
          <table className="data-table raw-table">
            <thead>
              <tr>
                <th>#</th>
                {Array.from({ length: maxCols }, (_, i) => (
                  <th key={i}>{String.fromCharCode(65 + (i % 26))}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => {
                const lineNumber = rowIndex + 1
                const isHeader = lineNumber === escala.headerRow

                return (
                  <tr key={lineNumber} className={isHeader ? 'raw-header-row' : ''}>
                    <td className="line-num">{lineNumber}</td>
                    {Array.from({ length: maxCols }, (_, colIndex) => (
                      <td key={colIndex}>{row[colIndex] || ''}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
