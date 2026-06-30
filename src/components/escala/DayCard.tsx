import type { CSSProperties } from 'react'
import type { DiaEscala } from '../../types'
import { formatDiaTitulo, isDomingo } from '../../lib/diaUtils'
import { MissaCard } from './MissaCard'

interface Props {
  dia: DiaEscala
  mes: number
  index: number
  showHeader?: boolean
}

export function DayCard({ dia, mes, index, showHeader = true }: Props) {
  const domingo = isDomingo(dia.diaSemana)

  return (
    <article
      className={`day-card${domingo ? ' day-card--domingo' : ''}${!showHeader ? ' day-card--sem-cabecalho' : ''}`}
      style={{ '--stagger': index } as CSSProperties}
    >
      {showHeader && (
        <header className="day-card__head">
          <h2 className="day-card__titulo">
            {formatDiaTitulo(dia.diaSemana, dia.diaNumero, mes)}
          </h2>
        </header>
      )}

      <div className="day-card__missas">
        {dia.missas.map((missa) => (
          <MissaCard key={missa.id} missa={missa} />
        ))}
      </div>
    </article>
  )
}
