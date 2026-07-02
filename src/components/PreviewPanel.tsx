interface Props {
  html: string | null
  onPreview: () => void
  onDownload: () => void
  disabled: boolean
  title?: string
  iframeTitle?: string
  emptyMessage?: string
  emptyHint?: string
}

export function PreviewPanel({
  html,
  onPreview,
  onDownload,
  disabled,
  title = 'Demonstrativo HTML',
  iframeTitle = 'Preview do demonstrativo',
  emptyMessage = 'Carregue a planilha para gerar o demonstrativo em HTML.',
  emptyHint = 'O documento é otimizado para impressão em A4 horizontal (PDF).',
}: Props) {
  return (
    <section className="panel preview-panel">
      <div className="preview-header">
        <h2>{title}</h2>
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
          title={iframeTitle}
          className="preview-frame"
          srcDoc={html}
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="preview-placeholder">
          <p>{emptyMessage}</p>
          {emptyHint && <p className="muted">{emptyHint}</p>}
        </div>
      )}
    </section>
  )
}
