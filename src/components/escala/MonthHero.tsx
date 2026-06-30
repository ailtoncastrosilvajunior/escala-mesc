import { useMemo, useRef } from 'react'
import type { EscalaMes } from '../../types'
import {
  getMesNome,
  mesKeyFromEscala,
  ultimosMesesParaCards,
} from '../../lib/mesRef'

interface Props {
  escala: EscalaMes
  meses?: EscalaMes[]
  mesAtivoKey?: string | null
  onSelectMes?: (key: string) => void
  isMesReleased?: (escala: EscalaMes) => boolean
  adminMode?: boolean
  loading: boolean
  onReload: () => void
  onAdminUnlock?: (key: string) => boolean
}

const TAP_WINDOW_MS = 2500
const TAP_COUNT = 5

export function MonthHero({
  escala,
  meses = [],
  mesAtivoKey,
  onSelectMes,
  isMesReleased,
  adminMode = false,
  loading,
  onReload,
  onAdminUnlock,
}: Props) {
  const tapCount = useRef(0)
  const tapTimer = useRef<number | null>(null)
  const opcoes = meses.length > 0 ? meses : [escala]
  const selectedKey = mesAtivoKey ?? mesKeyFromEscala(escala)

  const cards = useMemo(
    () => ultimosMesesParaCards(opcoes, selectedKey, 3),
    [opcoes, selectedKey],
  )

  const handleMetaClick = () => {
    if (!onAdminUnlock) return

    tapCount.current += 1
    if (tapTimer.current) window.clearTimeout(tapTimer.current)

    if (tapCount.current >= TAP_COUNT) {
      tapCount.current = 0
      const key = window.prompt('Chave de administrador')
      if (key && onAdminUnlock(key)) {
        window.alert('Modo administrador ativado neste aparelho.')
      } else if (key) {
        window.alert('Chave incorreta.')
      }
      return
    }

    tapTimer.current = window.setTimeout(() => {
      tapCount.current = 0
    }, TAP_WINDOW_MS)
  }

  return (
    <header className="month-hero">
      <div className="month-hero__top">
        <p
          className="month-hero__meta"
          onClick={onAdminUnlock ? handleMetaClick : undefined}
          onKeyDown={
            onAdminUnlock
              ? (e) => {
                  if (e.key === 'Enter') handleMetaClick()
                }
              : undefined
          }
          role={onAdminUnlock ? 'button' : undefined}
          tabIndex={onAdminUnlock ? 0 : undefined}
        >
          Face de Cristo · MESC
        </p>
        <button
          type="button"
          className="month-hero__refresh"
          onClick={onReload}
          disabled={loading}
          aria-label="Atualizar escala"
          title="Atualizar"
        >
          {loading ? '…' : '↻'}
        </button>
      </div>

      {onSelectMes ? (
        <div
          className="month-hero__cards"
          role="group"
          aria-label="Mês da escala"
        >
          {cards.map((item) => {
            const key = mesKeyFromEscala(item)
            const active = selectedKey === key
            const released = isMesReleased?.(item) ?? true
            const rascunho = !released && adminMode

            return (
              <button
                key={key}
                type="button"
                className={[
                  'month-card',
                  active ? 'month-card--active' : '',
                  rascunho ? 'month-card--draft' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectMes(key)}
                aria-pressed={active}
              >
                <span className="month-card__mes">{getMesNome(item.mes)}</span>
                <span className="month-card__ano">{item.ano}</span>
                {rascunho && (
                  <span className="month-card__badge">rascunho</span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <h1 className="month-hero__title">{escala.mesAno}</h1>
      )}
    </header>
  )
}
