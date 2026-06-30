import { useMemo } from 'react'
import {
  buildMonthGrid,
  getTodayISO,
  getWeekdayLabels,
} from '../../lib/calendarUtils'

interface Props {
  ano: number
  mes: number
  diasComServico: string[]
  selected: string | null
  onSelect: (dateISO: string | null) => void
  /** Busca ou horário ativos — legenda reflete o filtro */
  filtroAtivo?: boolean
}

export function MonthCalendar({
  ano,
  mes,
  diasComServico,
  selected,
  onSelect,
  filtroAtivo = false,
}: Props) {
  const todayISO = getTodayISO()
  const servicoSet = useMemo(() => new Set(diasComServico), [diasComServico])
  const cells = useMemo(
    () => buildMonthGrid(ano, mes, servicoSet, todayISO),
    [ano, mes, servicoSet, todayISO],
  )
  const weekdays = getWeekdayLabels()

  const diasOrdenados = useMemo(
    () => [...diasComServico].sort(),
    [diasComServico],
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
    <section className="month-calendar" aria-label="Calendário do mês">
      <div className="month-calendar__top">
        <h2 className="month-calendar__titulo">Calendário</h2>
        <p className="month-calendar__dica">
          <span className="month-calendar__marcador month-calendar__marcador--hoje" aria-hidden="true" />
          Hoje
          <span className="month-calendar__marcador month-calendar__marcador--servico" aria-hidden="true" />
          {filtroAtivo ? 'Com serviço no filtro' : 'Com escala'}
        </p>
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
          <span key={label} className="month-calendar__weekday">{label}</span>
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

          const isSelected = selected === cell.dateISO
          const isClickable = cell.hasEscala || cell.isToday
          const classNames = [
            'month-calendar__day',
            cell.isToday ? 'month-calendar__day--today' : '',
            cell.hasEscala ? 'month-calendar__day--has-escala' : '',
            isSelected ? 'month-calendar__day--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')

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
                cell.hasEscala ? 'com escala' : '',
                isSelected ? 'selecionado' : '',
              ]
                .filter(Boolean)
                .join(', ')}
              aria-pressed={isSelected}
            >
              {cell.dayNumber}
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
          <span>Ver escala de todo o mês</span>
        </button>
      ) : (
        <p className="month-calendar__hint">Toque em um dia marcado para ver quem serve</p>
      )}
    </section>
  )
}
