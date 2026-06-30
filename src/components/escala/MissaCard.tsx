import type { MissaEvent } from '../../types'
import { horarioLabel } from '../../lib/parseEscalaMesc'
import { isDiaUtil } from '../../lib/diaUtils'

interface Props {
  missa: MissaEvent
}

export function MissaCard({ missa }: Props) {
  const mostrarAdoracao = isDiaUtil(missa.diaSemana) && missa.adoracao.trim()

  return (
    <article className="missa-card">
      <header className="missa-card__top">
        <h3 className="missa-card__horario">Missa das {horarioLabel(missa.horario)}</h3>
        {missa.celebrante && (
          <p className="missa-card__padre">{missa.celebrante}</p>
        )}
      </header>

      <div className="missa-card__bloco missa-card__bloco--mesc">
        <span className="missa-card__rotulo">Comunhão (MESC)</span>
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
