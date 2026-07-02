import { useMemo } from 'react'
import {
  buildMonthGrid,
  getTodayISO,
  getWeekdayLabels,
} from '../../lib/calendarUtils'
import {
  SERVICO_TIPOS_LEGEND,
  servicoTipoDotClass,
  type ServicoTipoKey,
} from '../../lib/servicoExtraTipo'

interface Props {
  ano: number
  mes: number
  diasComPlantao: string[]
  tiposPorDia: Map<string, ServicoTipoKey[]>
  selected: string | null
  onSelect: (dateISO: string | null) => void
  filtroAtivo?: boolean
}

export function ExtraMonthCalendar({
  ano,
  mes,
  diasComPlantao,
  tiposPorDia,
  selected,
  onSelect,
  filtroAtivo = false,
}: Props) {
  const todayISO = getTodayISO()
  const plantaoSet = useMemo(
    () => new Set(diasComPlantao),
    [diasComPlantao],
  )
  const cells = useMemo(
    () => buildMonthGrid(ano, mes, plantaoSet, todayISO),
    [ano, mes, plantaoSet, todayISO],
  )
  const weekdays = getWeekdayLabels()

  const diasOrdenados = useMemo(
    () => [...diasComPlantao].sort(),
    [diasComPlantao],
  )

  const indiceSelecionado = selected ? diasOrdenados.indexOf(selected) : -1
  const hojeNoMes = cells.some((c) => c.isToday)
  const podeAnterior = indiceSelecionado > 0
  const podeProximo =
    indiceSelecionado >= 0 && indiceSelecionado < diasOrdenados.length - 1

  const handleDayClick = (cell: (typeof cells)[number]) => {
    if (!cell.dateISO) return
    if (!cell.hasEscala && !cell.isToday) return

    if (selected === cell.dateISO) {
      onSelect(null)
      return
    }

    onSelect(cell.dateISO)
  }

  const irParaHoje = () => {
    if (hojeNoMes) {
      onSelect(todayISO)
      return
    }
    onSelect(diasOrdenados[0] ?? null)
  }

  const irParaAnterior = () => {
    if (!podeAnterior) return
    onSelect(diasOrdenados[indiceSelecionado - 1])
  }

  const irParaProximo = () => {
    if (!podeProximo) return
    onSelect(diasOrdenados[indiceSelecionado + 1])
  }

  return (
    <section
      className="month-calendar month-calendar--extra"
      aria-label="Calendário do mês"
    >
      <div className="month-calendar__top">
        <h2 className="month-calendar__titulo">Calendário</h2>
        <p className="month-calendar__dica">
          <span
            className="month-calendar__marcador month-calendar__marcador--hoje"
            aria-hidden="true"
          />
          Hoje
          {SERVICO_TIPOS_LEGEND.map(({ key, label }) => (
            <span key={key} className="month-calendar__dica-item">
              <span
                className={`extra-cal-dot ${servicoTipoDotClass(key)} month-calendar__marcador--tipo`}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </p>
        {filtroAtivo && (
          <p className="month-calendar__dica-filtro">
            Mostrando apenas dias que batem com a busca
          </p>
        )}
      </div>

      <div className="month-calendar__acoes">
        <button type="button" className="cal-btn" onClick={irParaHoje}>
          Hoje
        </button>
        <button
          type="button"
          className="cal-btn"
          onClick={irParaAnterior}
          disabled={!podeAnterior}
        >
          ‹ Dia anterior
        </button>
        <button
          type="button"
          className="cal-btn"
          onClick={irParaProximo}
          disabled={!podeProximo}
        >
          Próximo dia ›
        </button>
      </div>

      <div className="month-calendar__weekdays" aria-hidden="true">
        {weekdays.map((label) => (
          <span key={label} className="month-calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="month-calendar__grid" role="grid">
        {cells.map((cell, index) => {
          if (!cell.isCurrentMonth || cell.dayNumber === null) {
            return (
              <span
                key={`empty-${index}`}
                className="month-calendar__day month-calendar__day--empty"
                aria-hidden="true"
              />
            )
          }

          const tipos = tiposPorDia.get(cell.dateISO!) ?? []
          const isSelected = selected === cell.dateISO
          const isClickable = cell.hasEscala || cell.isToday
          const classNames = [
            'month-calendar__day',
            cell.isToday ? 'month-calendar__day--today' : '',
            cell.hasEscala ? 'month-calendar__day--has-escala' : '',
            tipos.length > 0 ? 'month-calendar__day--has-eventos' : '',
            isSelected ? 'month-calendar__day--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')

          const tiposLabel =
            tipos.length > 0
              ? `, ${tipos.map((t) => SERVICO_TIPOS_LEGEND.find((l) => l.key === t)?.label ?? t).join(', ')}`
              : ''

          return (
            <button
              key={cell.dateISO}
              type="button"
              className={classNames}
              onClick={() => handleDayClick(cell)}
              disabled={!isClickable}
              aria-label={[
                `Dia ${cell.dayNumber}`,
                cell.isToday ? 'hoje' : '',
                cell.hasEscala ? 'com plantão' : '',
                tipos.length > 0 ? `eventos: ${tiposLabel.slice(2)}` : '',
                isSelected ? 'selecionado' : '',
              ]
                .filter(Boolean)
                .join(', ')}
              aria-pressed={isSelected}
            >
              {cell.dayNumber}
              {tipos.length > 0 && (
                <span className="extra-cal-dots" aria-hidden="true">
                  {tipos.map((tipo) => (
                    <span
                      key={tipo}
                      className={`extra-cal-dot ${servicoTipoDotClass(tipo)}`}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selected ? (
        <button
          type="button"
          className="month-calendar__ver-mes"
          onClick={() => onSelect(null)}
        >
          <span className="month-calendar__ver-mes-icon" aria-hidden="true">
            ⊞
          </span>
          <span>Ver extra de todo o mês</span>
        </button>
      ) : (
        <p className="month-calendar__hint">
          Toque em um dia marcado para ver plantão e eventos
        </p>
      )}
    </section>
  )
}
