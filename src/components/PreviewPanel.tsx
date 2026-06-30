interface Props {
  html: string | null
  onPreview: () => void
  onDownload: () => void
  disabled: boolean
}

export function PreviewPanel({ html, onPreview, onDownload, disabled }: Props) {
  return (
    <section className="panel preview-panel">
      <div className="preview-header">
        <h2>Demonstrativo HTML</h2>
        <div className="preview-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onPreview}
            disabled={disabled}
          >
            Abrir preview
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onDownload}
            disabled={disabled}
          >
            Baixar HTML
          </button>
        </div>
      </div>

      {html ? (
        <iframe
          title="Preview do demonstrativo"
          className="preview-frame"
          srcDoc={html}
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="preview-placeholder">
          <p>Carregue a planilha para gerar o demonstrativo em HTML.</p>
          <p className="muted">
            O documento é otimizado para impressão em A4 horizontal (PDF).
          </p>
        </div>
      )}
    </section>
  )
}
