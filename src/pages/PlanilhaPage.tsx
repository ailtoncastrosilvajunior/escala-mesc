import { SheetInspectPanel } from '../components/SheetInspectPanel'
import type { ParsedEscala, SheetConfig } from '../types'

interface Props {
  config: SheetConfig
  escala: ParsedEscala | null
  loading: boolean
  onReload: () => void
}

export function PlanilhaPage({ config, escala, loading, onReload }: Props) {
  const hasConfig = Boolean(config.spreadsheetId.trim())

  return (
    <div className="planilha-page">
      <section className="panel demonstrativo-toolbar">
        <div>
          <h2>Leitura da planilha</h2>
          <p className="panel-hint">
            Use esta tela depois de alterar a estrutura da planilha. O app relê a aba,
            detecta o cabeçalho e mostra como cada coluna foi interpretada.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onReload}
          disabled={loading || !hasConfig}
        >
          {loading ? 'Lendo planilha…' : 'Reler planilha'}
        </button>
      </section>

      <SheetInspectPanel escala={escala} sheetName={config.sheetName} />
    </div>
  )
}
