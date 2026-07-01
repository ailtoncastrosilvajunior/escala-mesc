import { useEffect, useMemo, useRef, useState } from 'react'
import type { EscalaMes } from '../types'
import { formatDiaTitulo } from '../lib/diaUtils'
import { getTodayISO, initialSelectedDate } from '../lib/calendarUtils'
import { getReleaseHint } from '../lib/escalaRelease'
import { filterEscalaMes, horariosComOcorrencia } from '../lib/parseEscalaMesc'
import { DayCard } from '../components/escala/DayCard'
import { EscalaFilters } from '../components/escala/EscalaFilters'
import { MonthCalendar } from '../components/escala/MonthCalendar'
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
  const [horarioFilter, setHorarioFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const resultadoRef = useRef<HTMLElement>(null)
  const escalaKey = escala ? `${escala.ano}-${escala.mes}` : null
  const releaseHint = getReleaseHint(escalaLiberadaAte)
  const mesRascunho = escala && adminMode && !isMesReleased(escala)

  useEffect(() => {
    if (!escala) {
      setSelectedDate(null)
      return
    }
    setSelectedDate(initialSelectedDate(escala))
    setHorarioFilter(null)
    setSearch('')
  }, [escalaKey, escala])

  const horariosDisponiveis = useMemo(() => {
    if (!escala) return []
    return horariosComOcorrencia(escala, search, null)
  }, [escala, search])

  useEffect(() => {
    if (horarioFilter && !horariosDisponiveis.includes(horarioFilter)) {
      setHorarioFilter(null)
    }
  }, [horarioFilter, horariosDisponiveis])

  const diasComServico = useMemo(() => {
    if (!escala) return []
    const porFiltros = filterEscalaMes(escala, horarioFilter, search, null)
    return porFiltros.dias.map((d) => d.dataISO)
  }, [escala, horarioFilter, search])

  const filtered = useMemo(() => {
    if (!escala) return null
    return filterEscalaMes(escala, horarioFilter, search, selectedDate)
  }, [escala, horarioFilter, search, selectedDate])

  const diaSelecionado = useMemo(() => {
    if (!escala || !selectedDate) return null
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
    if (!escala) return

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
    if (!escala) return

    const porFiltros = filterEscalaMes(escala, horario, search, null)
    const datas = porFiltros.dias.map((d) => d.dataISO)
    const today = getTodayISO()

    if (selectedDate && !datas.includes(selectedDate)) {
      setSelectedDate(datas.includes(today) ? today : escala.dias[0]?.dataISO ?? null)
    }
  }

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

      <section className="escala-resultado" ref={resultadoRef}>
        <h2 className="escala-resultado__titulo">
          {diaSelecionado
            ? formatDiaTitulo(
                diaSelecionado.diaSemana,
                diaSelecionado.diaNumero,
                escala.mes,
              )
            : selectedDate
              ? 'Escala do dia'
              : 'Escala do mês'}
        </h2>

        {filtered && filtered.dias.length > 0 ? (
          <div className="escala-grid">
            {filtered.dias.map((dia, index) => (
              <DayCard
                key={dia.dataISO}
                dia={dia}
                mes={escala.mes}
                index={index}
                showHeader={!selectedDate || filtered.dias.length > 1}
              />
            ))}
          </div>
        ) : (
          <div className="escala-empty-state escala-empty-state--inline">
            <p>Nenhuma escala encontrada. Tente outro dia no calendário ou limpe os filtros.</p>
            <button
              type="button"
              className="btn-escala btn-escala--ghost"
              onClick={() => {
                setHorarioFilter(null)
                setSearch('')
                setSelectedDate(initialSelectedDate(escala))
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
