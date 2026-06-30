import { EscalaTable } from '../components/EscalaTable'
import { PreviewPanel } from '../components/PreviewPanel'
import type { ParsedEscala, SheetConfig } from '../types'

interface Props {
  config: SheetConfig
  escala: ParsedEscala | null
  html: string | null
  loading: boolean
  onReload: () => void
  onPreview: () => void
  onDownload: () => void
}

export function DemonstrativoPage({
  config,
  escala,
  html,
  loading,
  onReload,
  onPreview,
  onDownload,
}: Props) {
  const hasConfig = Boolean(config.spreadsheetId.trim())

  return (
    <div className="demonstrativo-page">
      <section className="panel demonstrativo-toolbar">
        <div>
          <h2>Demonstrativo da escala</h2>
          <p className="panel-hint">
            {hasConfig
              ? `Planilha configurada · aba «${config.sheetName}»`
              : 'Configure a planilha em Configuração antes de gerar o demonstrativo.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onReload}
          disabled={loading || !hasConfig}
        >
          {loading ? 'Carregando…' : 'Atualizar escala'}
        </button>
      </section>

      <section className="panel">
        <h2>Dados carregados</h2>
        <EscalaTable linhas={escala?.linhas ?? []} />
      </section>

      <PreviewPanel
        html={html}
        onPreview={onPreview}
        onDownload={onDownload}
        disabled={!html}
      />
    </div>
  )
}
