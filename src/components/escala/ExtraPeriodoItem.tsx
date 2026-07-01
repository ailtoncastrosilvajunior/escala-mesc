import type { PlantaoPeriodo } from '../../types'
import {
  formatDiaSemanaCurto,
  formatPeriodoDescricao,
} from '../../lib/parseEscalaExtra'
import { ExtraServicoList } from './ExtraServicoList'

interface Props {
  periodo: PlantaoPeriodo
  mes: number
  todayISO?: string
}

export function ExtraPeriodoItem({ periodo, mes, todayISO }: Props) {
  const isPeriodoHoje = todayISO
    ? periodo.dias.some((d) => d.dataISO === todayISO)
    : false

  const temServicos = periodo.dias.some((d) => d.servicos.length > 0)
  const variosDias = periodo.dias.length > 1

  return (
    <article
      className={`extra-periodo${isPeriodoHoje ? ' extra-periodo--hoje' : ''}`}
      aria-label={`${formatPeriodoDescricao(periodo, mes)}: ${periodo.ministros.join(' e ')}`}
    >
      <div className="extra-periodo__corpo">
        <div className="extra-periodo__dias">
          {periodo.dias.map((dia, index) => (
            <div key={dia.dataISO} className="extra-periodo__dia-wrap">
              {index > 0 && (
                <span className="extra-periodo__sep" aria-hidden="true">
                  –
                </span>
              )}
              <div
                className={`extra-dia${
                  dia.dataISO === todayISO ? ' extra-dia--hoje' : ''
                }`}
              >
                <span className="extra-dia__num">{dia.diaNumero}</span>
                <span className="extra-dia__semana">
                  {formatDiaSemanaCurto(dia.diaSemana)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="extra-periodo__nomes">
          {periodo.ministros.map((nome) => (
            <span key={nome} className="extra-periodo__nome">
              {nome}
            </span>
          ))}
        </div>
      </div>

      {temServicos && (
        <div className="extra-periodo__servicos">
          {periodo.dias.map((dia) => {
            if (dia.servicos.length === 0) return null

            return (
              <div key={dia.dataISO} className="extra-dia-servicos">
                {variosDias && (
                  <p className="extra-dia-servicos__titulo">
                    {formatDiaSemanaCurto(dia.diaSemana)}, {dia.diaNumero}
                  </p>
                )}
                <ExtraServicoList servicos={dia.servicos} />
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
