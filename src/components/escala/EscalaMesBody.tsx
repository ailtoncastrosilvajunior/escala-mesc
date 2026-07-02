import { useEffect, useMemo, useRef, useState } from 'react'
import type { EscalaMes } from '../../types'
import { formatDiaTitulo } from '../../lib/diaUtils'
import { getTodayISO, initialSelectedDate } from '../../lib/calendarUtils'
import { filterEscalaMes, horariosComOcorrencia } from '../../lib/parseEscalaMesc'
import { DayCard } from './DayCard'
import { EscalaFilters } from './EscalaFilters'
import { MonthCalendar } from './MonthCalendar'

interface Props {
  escala: EscalaMes
  /** Exibe calendário para navegação por dia. Desligado na visão de lista. */
  showCalendar?: boolean
}

export function EscalaMesBody({ escala, showCalendar = true }: Props) {
  const [horarioFilter, setHorarioFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const resultadoRef = useRef<HTMLElement>(null)
  const escalaKey = `${escala.ano}-${escala.mes}`

  useEffect(() => {
    setSelectedDate(showCalendar ? initialSelectedDate(escala) : null)
    setHorarioFilter(null)
    setSearch('')
  }, [escalaKey, escala, showCalendar])

  const horariosDisponiveis = useMemo(
    () => horariosComOcorrencia(escala, search, null),
    [escala, search],
  )

  useEffect(() => {
    if (horarioFilter && !horariosDisponiveis.includes(horarioFilter)) {
      setHorarioFilter(null)
    }
  }, [horarioFilter, horariosDisponiveis])

  const diasComServico = useMemo(() => {
    const porFiltros = filterEscalaMes(escala, horarioFilter, search, null)
    return porFiltros.dias.map((d) => d.dataISO)
  }, [escala, horarioFilter, search])

  const dateFilter = showCalendar ? selectedDate : null

  const filtered = useMemo(
    () => filterEscalaMes(escala, horarioFilter, search, dateFilter),
    [escala, horarioFilter, search, dateFilter],
  )

  const diaSelecionado = useMemo(() => {
    if (!selectedDate) return null
    return escala.dias.find((d) => d.dataISO === selectedDate) ?? null
  }, [escala, selectedDate])

  const handleSelectDate = (dateISO: string | null) => {
    setSelectedDate(dateISO)
    requestAnimationFrame(() => {
      resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (!showCalendar) return

    const today = getTodayISO()
    const [y, m] = today.split('-').map(Number)
    const hojeNoMes = y === escala.ano && m === escala.mes

    if (!value.trim()) {
      setSelectedDate(hojeNoMes ? today : initialSelectedDate(escala))
      return
    }

    const porBusca = filterEscalaMes(escala, horarioFilter, value, null)
    const datas = porBusca.dias.map((d) => d.dataISO)
    if (datas.length === 1) {
      setSelectedDate(datas[0])
    } else if (selectedDate && !datas.includes(selectedDate)) {
      setSelectedDate(hojeNoMes && datas.includes(today) ? today : null)
    }
  }

  const handleHorarioChange = (horario: string | null) => {
    setHorarioFilter(horario)
    if (!showCalendar) return

    const porFiltros = filterEscalaMes(escala, horario, search, null)
    const datas = porFiltros.dias.map((d) => d.dataISO)
    const today = getTodayISO()

    if (selectedDate && !datas.includes(selectedDate)) {
      setSelectedDate(
        datas.includes(today) ? today : escala.dias[0]?.dataISO ?? null,
      )
    }
  }

  const limparFiltros = () => {
    setHorarioFilter(null)
    setSearch('')
    if (showCalendar) {
      setSelectedDate(initialSelectedDate(escala))
    }
  }

  return (
    <>
      <div className="escala-busca">
        <EscalaFilters
          horarios={horariosDisponiveis}
          selected={horarioFilter}
          onChange={handleHorarioChange}
          search={search}
          onSearchChange={handleSearchChange}
          variant="search"
        />
      </div>

      {showCalendar && (
        <section className="escala-calendario-wrap" aria-label="Navegação por dia">
          <MonthCalendar
            ano={escala.ano}
            mes={escala.mes}
            diasComServico={diasComServico}
            selected={selectedDate}
            onSelect={handleSelectDate}
            filtroAtivo={Boolean(search.trim() || horarioFilter)}
          />

          {horariosDisponiveis.length > 1 && (
            <EscalaFilters
              horarios={horariosDisponiveis}
              selected={horarioFilter}
              onChange={handleHorarioChange}
              variant="horarios"
            />
          )}
        </section>
      )}

      {!showCalendar && horariosDisponiveis.length > 1 && (
        <div className="escala-busca escala-busca--horarios">
          <EscalaFilters
            horarios={horariosDisponiveis}
            selected={horarioFilter}
            onChange={setHorarioFilter}
            variant="horarios"
          />
        </div>
      )}

      <section className="escala-resultado" ref={resultadoRef}>
        <h2 className="escala-resultado__titulo">
          {showCalendar && diaSelecionado
            ? formatDiaTitulo(
                diaSelecionado.diaSemana,
                diaSelecionado.diaNumero,
                escala.mes,
              )
            : showCalendar && selectedDate
              ? 'Escala do dia'
              : 'Escala do mês'}
        </h2>

        {filtered.dias.length > 0 ? (
          <div className="escala-grid">
            {filtered.dias.map((dia, index) => (
              <DayCard
                key={dia.dataISO}
                dia={dia}
                mes={escala.mes}
                index={index}
                showHeader={!dateFilter || filtered.dias.length > 1}
              />
            ))}
          </div>
        ) : (
          <div className="escala-empty-state escala-empty-state--inline">
            <p>
              {showCalendar
                ? 'Nenhuma escala encontrada. Tente outro dia no calendário ou limpe os filtros.'
                : 'Nenhuma escala encontrada. Limpe os filtros ou a busca.'}
            </p>
            <button
              type="button"
              className="btn-escala btn-escala--ghost"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </>
  )
}
