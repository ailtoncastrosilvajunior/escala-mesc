import type { MissaEvent } from '../../types'
import { horarioLabel } from '../../lib/parseEscalaMesc'
import { isDiaUtil } from '../../lib/diaUtils'

interface Props {
  missa: MissaEvent
}

export function MissaCard({ missa }: Props) {
  const mostrarAdoracao = isDiaUtil(missa.diaSemana) && missa.adoracao.trim()
  const horario = horarioLabel(missa.horario)
  const celebrante = missa.celebrante.trim()
  const titulo = celebrante || 'Missa'

  return (
    <article
      className="missa-card"
      aria-label={`Missa das ${horario}${celebrante ? `, ${celebrante}` : ''}`}
    >
      <header className="missa-card__top">
        <span className="missa-card__badge" aria-hidden="true">
          {horario}
        </span>
        <h3
          className={`missa-card__celebrante${
            celebrante ? ' missa-card__celebrante--nome' : ''
          }`}
        >
          {titulo}
        </h3>
      </header>

      <div className="missa-card__bloco missa-card__bloco--mesc">
        <span className="missa-card__rotulo">COMUNHÃO (MESC)</span>
        <p className="missa-card__valor">{missa.mesc}</p>
      </div>

      {mostrarAdoracao && (
        <div className="missa-card__bloco missa-card__bloco--adoracao">
          <span className="missa-card__rotulo">Adoração · 7h30 às 9h30</span>
          <p className="missa-card__valor">{missa.adoracao}</p>
        </div>
      )}

      {missa.observacoes && (
        <p className="missa-card__obs">{missa.observacoes}</p>
      )}
    </article>
  )
}
