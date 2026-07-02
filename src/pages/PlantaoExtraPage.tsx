import { useEffect, useMemo, useState } from 'react'
import type { EscalaMes, PlantaoExtraMes } from '../types'
import { getTodayISO, initialSelectedDate } from '../lib/calendarUtils'
import { getReleaseHint } from '../lib/escalaRelease'
import { formatDiaTitulo } from '../lib/diaUtils'
import {
  filterPlantaoExtraMes,
  findPlantaoPeriodoHoje,
} from '../lib/parseEscalaExtra'
import { tiposUnicosDoDia } from '../lib/servicoExtraTipo'
import { ExtraMonthCalendar } from '../components/escala/ExtraMonthCalendar'
import { ExtraPeriodoItem } from '../components/escala/ExtraPeriodoItem'
import { ExtraServicoList } from '../components/escala/ExtraServicoList'
import { EscalaFilters } from '../components/escala/EscalaFilters'
import { MonthHero } from '../components/escala/MonthHero'
import '../styles/escala-mes.css'

interface Props {
  plantao: PlantaoExtraMes | null
  meses: PlantaoExtraMes[]
  totalMesesNaPlanilha?: number
  mesAtivoKey: string | null
  onSelectMes: (key: string) => void
  isMesReleased: (escala: EscalaMes) => boolean
  adminMode?: boolean
  loading: boolean
  onReload: () => void
  onAdminUnlock?: (key: string) => boolean
  escalaLiberadaAte?: string
  loadError?: string | null
}

export function PlantaoExtraPage({
  plantao,
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
  loadError,
}: Props) {
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const todayISO = getTodayISO()
  const plantaoKey = plantao ? `${plantao.ano}-${plantao.mes}` : null
  const releaseHint = getReleaseHint(escalaLiberadaAte)
  const mesRascunho = plantao && adminMode && !isMesReleased({
    mesAno: plantao.mesAno,
    mes: plantao.mes,
    ano: plantao.ano,
    dias: [],
    horarios: [],
    totalMissas: 0,
  })

  useEffect(() => {
    if (!plantao) {
      setSelectedDate(null)
      return
    }
    setSelectedDate(initialSelectedDate(plantao))
    setSearch('')
  }, [plantaoKey, plantao])

  const forCalendar = useMemo(() => {
    if (!plantao) return null
    return filterPlantaoExtraMes(plantao, search)
  }, [plantao, search])

  const diasComPlantao = useMemo(() => {
    if (!forCalendar) return []
    return forCalendar.dias.map((d) => d.dataISO)
  }, [forCalendar])

  const tiposPorDia = useMemo(() => {
    const map = new Map<string, ReturnType<typeof tiposUnicosDoDia>>()
    if (!forCalendar) return map
    for (const dia of forCalendar.dias) {
      const tipos = tiposUnicosDoDia(dia.servicos)
      if (tipos.length > 0) {
        map.set(dia.dataISO, tipos)
      }
    }
    return map
  }, [forCalendar])

  const filtered = useMemo(() => {
    if (!plantao) return null
    return filterPlantaoExtraMes(plantao, search, selectedDate)
  }, [plantao, search, selectedDate])

  const diaSelecionado = useMemo(() => {
    if (!plantao || !selectedDate) return null
    return plantao.dias.find((d) => d.dataISO === selectedDate) ?? null
  }, [plantao, selectedDate])

  const periodoHoje = useMemo(() => {
    if (!plantao) return null
    const [y, m] = todayISO.split('-').map(Number)
    if (y !== plantao.ano || m !== plantao.mes) return null
    return findPlantaoPeriodoHoje(plantao, todayISO)
  }, [plantao, todayISO])

  const diaHoje = useMemo(() => {
    if (!plantao) return null
    return plantao.dias.find((d) => d.dataISO === todayISO) ?? null
  }, [plantao, todayISO])

  if (!plantao) {
    const aguardandoPublicacao =
      totalMesesNaPlanilha > 0 && meses.length === 0 && !loading

    return (
      <div className="escala-mes escala-mes--empty">
        <div className="escala-empty-state">
          <div className="escala-empty-state__icon" aria-hidden="true">◷</div>
          <h2>Escala extra</h2>
          {loadError ? (
            <p>{loadError}</p>
          ) : aguardandoPublicacao ? (
            <p>
              A escala extra ainda não foi publicada
              {releaseHint ? ` (até ${releaseHint} para os ministros)` : ''}.
            </p>
          ) : (
            <p>Carregue a planilha para ver a escala extra.</p>
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

  const escalaStub = {
    mesAno: plantao.mesAno,
    mes: plantao.mes,
    ano: plantao.ano,
    dias: [],
    horarios: [],
    totalMissas: 0,
  }

  return (
    <div className="escala-mes">
      <MonthHero
        escala={escalaStub}
        meses={meses.map((m) => ({
          mesAno: m.mesAno,
          mes: m.mes,
          ano: m.ano,
          dias: [],
          horarios: [],
          totalMissas: 0,
        }))}
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
          Pré-visualização — esta escala extra ainda não está publicada para os ministros.
        </p>
      )}

      {periodoHoje && diaHoje && (
        <section className="plantao-hoje" aria-label="Extra de hoje">
          <p className="plantao-hoje__label">Extra de hoje</p>
          <h2 className="plantao-hoje__titulo">
            {formatDiaTitulo(diaHoje.diaSemana, diaHoje.diaNumero, plantao.mes)}
          </h2>
          <p className="plantao-hoje__nomes">
            {periodoHoje.ministros.join(' · ')}
          </p>
          {periodoHoje.dias.length > 1 && periodoHoje.fimISO !== todayISO && (
            <p className="plantao-hoje__ate">
              Até{' '}
              {formatDiaTitulo(
                periodoHoje.dias[periodoHoje.dias.length - 1].diaSemana,
                periodoHoje.dias[periodoHoje.dias.length - 1].diaNumero,
                plantao.mes,
              )}
            </p>
          )}
          {diaHoje.servicos.length > 0 && (
            <div className="plantao-hoje__servicos">
              <ExtraServicoList servicos={diaHoje.servicos} />
            </div>
          )}
        </section>
      )}

      <div className="escala-busca">
        <EscalaFilters
          horarios={[]}
          selected={null}
          onChange={() => {}}
          search={search}
          onSearchChange={setSearch}
          variant="search"
        />
      </div>

      <section className="escala-calendario-wrap" aria-label="Navegação por dia">
        <ExtraMonthCalendar
          ano={plantao.ano}
          mes={plantao.mes}
          diasComPlantao={diasComPlantao}
          tiposPorDia={tiposPorDia}
          selected={selectedDate}
          onSelect={setSelectedDate}
          filtroAtivo={Boolean(search.trim())}
        />
      </section>

      <section className="plantao-lista-wrap" aria-label="Extra do mês">
        <h2 className="escala-resultado__titulo">
          {diaSelecionado
            ? formatDiaTitulo(
                diaSelecionado.diaSemana,
                diaSelecionado.diaNumero,
                plantao.mes,
              )
            : selectedDate
              ? 'Extra do dia'
              : 'Extra do mês'}
        </h2>

        {filtered && filtered.periodos.length > 0 ? (
          <ul className="plantao-lista">
            {filtered.periodos.map((periodo) => (
              <li key={periodo.inicioISO}>
                <ExtraPeriodoItem
                  periodo={periodo}
                  mes={plantao.mes}
                  todayISO={todayISO}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="escala-empty-state escala-empty-state--inline">
            <p>Nenhuma escala extra encontrada. Limpe a busca para ver a lista completa.</p>
            {search.trim() && (
              <button
                type="button"
                className="btn-escala btn-escala--ghost"
                onClick={() => {
                  setSearch('')
                  setSelectedDate(initialSelectedDate(plantao))
                }}
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
