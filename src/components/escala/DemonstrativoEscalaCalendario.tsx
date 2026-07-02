import { useEffect, useMemo, useState } from 'react'
import type { DiaEscala, EscalaMes, MissaEvent } from '../../types'
import {
  buildMonthGrid,
  getTodayISO,
  getWeekdayLabels,
} from '../../lib/calendarUtils'
import { isDomingo, isDiaUtil } from '../../lib/diaUtils'
import { filterEscalaMes, horarioLabel, horariosComOcorrencia } from '../../lib/parseEscalaMesc'
import { EscalaFilters } from './EscalaFilters'

interface Props {
  escala: EscalaMes
}

function MissaCalendarioBloco({ missa }: { missa: MissaEvent }) {
  const horario = horarioLabel(missa.horario)
  const celebrante = missa.celebrante.trim()
  const mostrarAdoracao = isDiaUtil(missa.diaSemana) && missa.adoracao.trim()

  return (
    <div className="demo-cal-missa">
      <div className="demo-cal-missa__head">
        <span className="demo-cal-missa__hora">{horario}</span>
        {celebrante && (
          <span className="demo-cal-missa__celebrante">{celebrante}</span>
        )}
      </div>
      {missa.mesc.trim() && (
        <div className="demo-cal-missa__bloco demo-cal-missa__bloco--mesc">
          <span className="demo-cal-missa__rotulo">Comunhão (MESC)</span>
          <span className="demo-cal-missa__valor">{missa.mesc}</span>
        </div>
      )}
      {mostrarAdoracao && (
        <div className="demo-cal-missa__bloco demo-cal-missa__bloco--adoracao">
          <span className="demo-cal-missa__rotulo">Adoração · 7h30–9h30</span>
          <span className="demo-cal-missa__valor">{missa.adoracao}</span>
        </div>
      )}
      {missa.observacoes.trim() && (
        <p className="demo-cal-missa__obs">{missa.observacoes}</p>
      )}
    </div>
  )
}

function DiaCalendarioCell({
  dia,
  isToday,
}: {
  dia: DiaEscala
  isToday: boolean
}) {
  const domingo = isDomingo(dia.diaSemana)

  return (
    <article
      className={[
        'demo-cal-cell',
        'demo-cal-cell--com-escala',
        domingo ? 'demo-cal-cell--domingo' : '',
        isToday ? 'demo-cal-cell--hoje' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${dia.diaSemana}, dia ${dia.diaNumero}`}
    >
      <header className="demo-cal-cell__head">
        <span className="demo-cal-cell__num">{dia.diaNumero}</span>
        <span className="demo-cal-cell__semana">{dia.diaSemana.slice(0, 3)}</span>
      </header>
      <div className="demo-cal-cell__conteudo">
        {dia.missas.map((missa) => (
          <MissaCalendarioBloco key={missa.id} missa={missa} />
        ))}
      </div>
    </article>
  )
}

export function DemonstrativoEscalaCalendario({ escala }: Props) {
  const [horarioFilter, setHorarioFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const todayISO = getTodayISO()
  const escalaKey = `${escala.ano}-${escala.mes}`

  useEffect(() => {
    setHorarioFilter(null)
    setSearch('')
  }, [escalaKey])

  const horariosDisponiveis = useMemo(
    () => horariosComOcorrencia(escala, search, null),
    [escala, search],
  )

  useEffect(() => {
    if (horarioFilter && !horariosDisponiveis.includes(horarioFilter)) {
      setHorarioFilter(null)
    }
  }, [horarioFilter, horariosDisponiveis])

  const filtered = useMemo(
    () => filterEscalaMes(escala, horarioFilter, search, null),
    [escala, horarioFilter, search],
  )

  const diaMap = useMemo(
    () => new Map(filtered.dias.map((d) => [d.dataISO, d])),
    [filtered],
  )

  const diasComServico = useMemo(
    () => new Set(filtered.dias.map((d) => d.dataISO)),
    [filtered],
  )

  const cells = useMemo(
    () => buildMonthGrid(escala.ano, escala.mes, diasComServico, todayISO),
    [escala.ano, escala.mes, diasComServico, todayISO],
  )

  const weekdays = getWeekdayLabels()
  const filtroAtivo = Boolean(search.trim() || horarioFilter)
  const temResultado = filtered.dias.length > 0

  return (
    <section className="demo-cal" aria-label="Calendário com escala do mês">
      <div className="demo-cal__filtros">
        <EscalaFilters
          horarios={horariosDisponiveis}
          selected={horarioFilter}
          onChange={setHorarioFilter}
          search={search}
          onSearchChange={setSearch}
          variant="search"
        />
        {horariosDisponiveis.length > 1 && (
          <EscalaFilters
            horarios={horariosDisponiveis}
            selected={horarioFilter}
            onChange={setHorarioFilter}
            variant="horarios"
          />
        )}
      </div>

      {filtroAtivo && !temResultado ? (
        <div className="demonstrativo-escala-empty">
          <p>Nenhuma escala encontrada com os filtros atuais.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setHorarioFilter(null)
              setSearch('')
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="demo-cal__weekdays" aria-hidden="true">
            {weekdays.map((label) => (
              <span key={label} className="demo-cal__weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="demo-cal__grid" role="grid">
            {cells.map((cell, index) => {
              if (!cell.isCurrentMonth || cell.dayNumber === null || !cell.dateISO) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="demo-cal-cell demo-cal-cell--empty"
                    aria-hidden="true"
                  />
                )
              }

              const dia = diaMap.get(cell.dateISO)
              if (dia && dia.missas.length > 0) {
                return (
                  <DiaCalendarioCell
                    key={cell.dateISO}
                    dia={dia}
                    isToday={cell.isToday}
                  />
                )
              }

              return (
                <div
                  key={cell.dateISO}
                  className={[
                    'demo-cal-cell',
                    'demo-cal-cell--vazio',
                    cell.isToday ? 'demo-cal-cell--hoje' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`Dia ${cell.dayNumber}${cell.isToday ? ', hoje' : ''}`}
                >
                  <header className="demo-cal-cell__head">
                    <span className="demo-cal-cell__num">{cell.dayNumber}</span>
                  </header>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
