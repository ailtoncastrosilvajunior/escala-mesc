import type { EscalaMes } from '../types'
import { getReleaseHint } from '../lib/escalaRelease'
import { EscalaMesBody } from '../components/escala/EscalaMesBody'
import { MonthHero } from '../components/escala/MonthHero'
import '../styles/escala-mes.css'

interface Props {
  escala: EscalaMes | null
  meses: EscalaMes[]
  totalMesesNaPlanilha?: number
  mesAtivoKey: string | null
  onSelectMes: (key: string) => void
  isMesReleased: (escala: EscalaMes) => boolean
  adminMode?: boolean
  loading: boolean
  onReload: () => void
  onAdminUnlock?: (key: string) => boolean
  escalaLiberadaAte?: string
}

export function EscalaMesPage({
  escala,
  meses,
  totalMesesNaPlanilha = 0,
  mesAtivoKey,
  onSelectMes,
  isMesReleased,
  adminMode = false,
  loading,
  onReload,
  onAdminUnlock,
  escalaLiberadaAte,
}: Props) {
  const releaseHint = getReleaseHint(escalaLiberadaAte)
  const mesRascunho = escala && adminMode && !isMesReleased(escala)

  if (!escala) {
    const aguardandoPublicacao =
      totalMesesNaPlanilha > 0 && meses.length === 0 && !loading

    return (
      <div className="escala-mes escala-mes--empty">
        <div className="escala-empty-state">
          <div className="escala-empty-state__icon" aria-hidden="true">✦</div>
          <h2>Escala do mês</h2>
          {aguardandoPublicacao ? (
            <p>
              A escala ainda não foi publicada
              {releaseHint ? ` (até ${releaseHint} para os ministros)` : ''}.
            </p>
          ) : (
            <p>Carregue a planilha para ver sua escala MESC.</p>
          )}
          <button
            type="button"
            className="btn-escala"
            onClick={onReload}
            disabled={loading}
          >
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="escala-mes">
      <MonthHero
        escala={escala}
        meses={meses}
        mesAtivoKey={mesAtivoKey}
        onSelectMes={onSelectMes}
        isMesReleased={isMesReleased}
        adminMode={adminMode}
        loading={loading}
        onReload={onReload}
        onAdminUnlock={onAdminUnlock}
      />

      {mesRascunho && (
        <p className="escala-rascunho-aviso" role="status">
          Pré-visualização — este mês ainda não está publicado para os ministros.
        </p>
      )}

      <EscalaMesBody escala={escala} />
    </div>
  )
}
