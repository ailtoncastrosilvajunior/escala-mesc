import { useMemo } from 'react'
import { MonthHero } from '../components/escala/MonthHero'
import { DemonstrativoEscalaCalendario } from '../components/escala/DemonstrativoEscalaCalendario'
import { DemonstrativoMinistrosPanel } from '../components/escala/DemonstrativoMinistrosPanel'
import { PreviewPanel } from '../components/PreviewPanel'
import {
  calendarioHtmlFilename,
  generateCalendarioDemonstrativoHtml,
} from '../lib/generateCalendarioHtml'
import {
  downloadHtml,
  openHtmlPreview,
} from '../lib/generateHtml'
import type { EscalaMes, ParsedEscala, PlantaoExtraMes, SheetConfig } from '../types'
import '../styles/escala-mes.css'

interface Props {
  config: SheetConfig
  escala: ParsedEscala | null
  escalaMes: EscalaMes | null
  plantaoMes: PlantaoExtraMes | null
  meses: EscalaMes[]
  totalMesesNaPlanilha: number
  mesAtivoKey: string | null
  onSelectMes: (key: string) => void
  isMesReleased: (escala: EscalaMes) => boolean
  loading: boolean
  onReload: () => void
}

export function DemonstrativoPage({
  config,
  escala,
  escalaMes,
  plantaoMes,
  meses,
  totalMesesNaPlanilha,
  mesAtivoKey,
  onSelectMes,
  isMesReleased,
  loading,
  onReload,
}: Props) {
  const hasConfig = Boolean(config.spreadsheetId.trim())
  const temFormatoMesc = totalMesesNaPlanilha > 0

  const calendarioHtml = useMemo(() => {
    if (!escalaMes) return null
    return generateCalendarioDemonstrativoHtml(config, escalaMes)
  }, [config, escalaMes])

  const handleCalendarioPreview = () => {
    if (calendarioHtml) openHtmlPreview(calendarioHtml)
  }

  const handleCalendarioDownload = () => {
    if (calendarioHtml && escalaMes) {
      downloadHtml(calendarioHtml, calendarioHtmlFilename(escalaMes))
    }
  }

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

      <section className="panel demonstrativo-escala-panel">
        <div className="demonstrativo-escala-panel__head">
          <div>
            <h2>Escala MESC</h2>
            <p className="panel-hint">
              Calendário do mês com missas, comunhão e adoração em cada dia.
            </p>
          </div>
        </div>

        {!temFormatoMesc ? (
          <div className="demonstrativo-escala-empty">
            <p>
              {escala && escala.linhas.length > 0
                ? 'A aba carregada não está no formato MESC (cabeçalho com Data, Horário, Celebrante…).'
                : 'Carregue a planilha para visualizar a escala MESC.'}
            </p>
          </div>
        ) : !escalaMes ? (
          <div className="demonstrativo-escala-empty">
            <p>Selecione um mês com escala para visualizar.</p>
          </div>
        ) : (
          <div className="demonstrativo-escala-preview escala-mes escala-mes--embedded">
            <MonthHero
              escala={escalaMes}
              meses={meses}
              mesAtivoKey={mesAtivoKey}
              onSelectMes={onSelectMes}
              isMesReleased={isMesReleased}
              adminMode
              loading={loading}
              onReload={onReload}
            />
            <DemonstrativoEscalaCalendario escala={escalaMes} />
            <DemonstrativoMinistrosPanel
              escala={escalaMes}
              plantao={plantaoMes}
            />
          </div>
        )}
      </section>

      <PreviewPanel
        html={calendarioHtml}
        onPreview={handleCalendarioPreview}
        onDownload={handleCalendarioDownload}
        disabled={!calendarioHtml}
        title="Impressão do calendário"
        iframeTitle="Preview de impressão do calendário"
        emptyMessage="Selecione um mês com escala MESC para gerar o calendário para impressão."
        emptyHint="Calendário do mês · A4 horizontal (PDF)."
      />
    </div>
  )
}
