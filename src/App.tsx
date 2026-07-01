import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppNav } from './components/AppNav'
import {
  isAdminUnlocked,
  isAdminView,
  lockAdmin,
  tryUnlockFromUrl,
  tryUnlockWithKey,
} from './lib/adminMode'
import {
  filterReleasedEscalas,
  filterReleasedPlantoes,
  isEscalaReleased,
  isMonthReleased,
} from './lib/escalaRelease'
import {
  mesKeyFromEscala,
  pickDefaultMesKey,
  readSavedMesKey,
  saveMesKey,
} from './lib/mesRef'
import {
  downloadHtml,
  generateDemonstrativoHtml,
  openHtmlPreview,
} from './lib/generateHtml'
import { fetchSheetRows } from './lib/googleSheets'
import {
  downloadConfigFile,
  getConfigSourceHint,
  loadAppConfig,
  saveLocalConfig,
} from './lib/loadConfig'
import { inferPeriodo, parseEscala } from './lib/parseEscala'
import { isMescSheetFormat, parseEscalaMescAll } from './lib/parseEscalaMesc'
import { parsePlantaoExtraAll } from './lib/parseEscalaExtra'
import { AppBottomNav } from './components/AppBottomNav'
import { ConfiguracaoPage } from './pages/ConfiguracaoPage'
import { DemonstrativoPage } from './pages/DemonstrativoPage'
import { EscalaMesPage } from './pages/EscalaMesPage'
import { PlanilhaPage } from './pages/PlanilhaPage'
import { PlantaoExtraPage } from './pages/PlantaoExtraPage'
import type { AppView, EscalaMes, ParsedEscala, PlantaoExtraMes, SheetConfig } from './types'
import './App.css'

function App() {
  const [view, setView] = useState<AppView>('escala-mes')
  const [config, setConfig] = useState<SheetConfig | null>(null)
  const [configSource, setConfigSource] = useState('')
  const [escala, setEscala] = useState<ParsedEscala | null>(null)
  const [escalaMes, setEscalaMes] = useState<EscalaMes | null>(null)
  const [escalasMes, setEscalasMes] = useState<EscalaMes[]>([])
  const [plantoesMes, setPlantoesMes] = useState<PlantaoExtraMes[]>([])
  const [plantaoMes, setPlantaoMes] = useState<PlantaoExtraMes | null>(null)
  const [plantaoError, setPlantaoError] = useState<string | null>(null)
  const [mesAtivoKey, setMesAtivoKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [adminMode, setAdminMode] = useState(() => isAdminUnlocked())

  useEffect(() => {
    if (tryUnlockFromUrl()) setAdminMode(true)
  }, [])

  useEffect(() => {
    if (!adminMode && isAdminView(view)) {
      setView('escala-mes')
    }
  }, [adminMode, view])

  const handleAdminUnlock = useCallback((key: string) => {
    if (!tryUnlockWithKey(key)) return false
    setAdminMode(true)
    return true
  }, [])

  const handleAdminLock = useCallback(() => {
    lockAdmin()
    setAdminMode(false)
    setView('escala-mes')
  }, [])

  const loadEscala = useCallback(async (currentConfig: SheetConfig) => {
    if (!currentConfig.spreadsheetId.trim()) {
      setEscala(null)
      setEscalaMes(null)
      setEscalasMes([])
      setPlantoesMes([])
      setPlantaoMes(null)
      setPlantaoError(null)
      setMesAtivoKey(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { rows } = await fetchSheetRows(
        currentConfig.spreadsheetId,
        currentConfig.sheetName,
      )

      const headerRowIndex = rows.findIndex((row) =>
        isMescSheetFormat(row),
      )
      const headers = headerRowIndex >= 0 ? rows[headerRowIndex] : rows[0] ?? []

      const todas = isMescSheetFormat(headers) ? parseEscalaMescAll(rows) : []
      setEscalasMes(todas)

      const parsed = parseEscala(rows, {
        headerRow: currentConfig.headerRow,
        columns: currentConfig.columns,
      })

      setConfig((prev) => {
        if (!prev) return currentConfig
        const visiveis = filterReleasedEscalas(
          todas,
          adminMode,
          currentConfig.escalaLiberadaAte,
        )
        const key = pickDefaultMesKey(visiveis, readSavedMesKey())
        const mesc =
          visiveis.find((e) => mesKeyFromEscala(e) === key) ??
          todas[todas.length - 1] ??
          null
        const periodo =
          prev.periodo ||
          mesc?.mesAno ||
          inferPeriodo(parsed.linhas)
        return { ...prev, periodo }
      })
      setEscala(parsed)

      const extraName = currentConfig.extraSheetName?.trim()
      if (extraName) {
        try {
          const { rows: extraRows } = await fetchSheetRows(
            currentConfig.spreadsheetId,
            extraName,
          )
          let servicoRows: string[][] | undefined
          const servicosName = currentConfig.extraServicosSheetName?.trim()
          if (servicosName) {
            try {
              const fetched = await fetchSheetRows(
                currentConfig.spreadsheetId,
                servicosName,
              )
              servicoRows = fetched.rows
            } catch {
              servicoRows = undefined
            }
          }
          setPlantoesMes(parsePlantaoExtraAll(extraRows, servicoRows))
          setPlantaoError(null)
        } catch (err) {
          setPlantoesMes([])
          setPlantaoError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar aba de escala extra.',
          )
        }
      } else {
        setPlantoesMes([])
        setPlantaoError(null)
      }
    } catch (err) {
      setEscala(null)
      setEscalaMes(null)
      setEscalasMes([])
      setPlantoesMes([])
      setPlantaoMes(null)
      setPlantaoError(null)
      setMesAtivoKey(null)
      setError(err instanceof Error ? err.message : 'Erro ao carregar planilha.')
    } finally {
      setLoading(false)
    }
  }, [adminMode])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const { config: loaded, sources } = await loadAppConfig()
      if (cancelled) return

      setConfig(loaded)
      setConfigSource(getConfigSourceHint(sources))
      setBooting(false)

      if (loaded.spreadsheetId.trim()) {
        await loadEscala(loaded)
      }
    }

    boot()

    return () => {
      cancelled = true
    }
  }, [loadEscala])

  const releaseLimit = config?.escalaLiberadaAte

  const mesesParaPicker = useMemo(
    () =>
      adminMode
        ? escalasMes
        : filterReleasedEscalas(escalasMes, false, releaseLimit),
    [escalasMes, adminMode, releaseLimit],
  )

  const plantoesParaPicker = useMemo(
    () =>
      adminMode
        ? plantoesMes
        : filterReleasedPlantoes(plantoesMes, false, releaseLimit),
    [plantoesMes, adminMode, releaseLimit],
  )

  const handleSelectMes = useCallback(
    (key: string) => {
      const escalaItem = escalasMes.find((e) => mesKeyFromEscala(e) === key)
      const plantaoItem = plantoesMes.find((p) => mesKeyFromEscala(p) === key)
      if (!escalaItem && !plantaoItem) return

      const ref = escalaItem ?? plantaoItem!
      if (!isMonthReleased(ref.ano, ref.mes, adminMode, releaseLimit)) return

      saveMesKey(key)
      setMesAtivoKey(key)
    },
    [escalasMes, plantoesMes, adminMode, releaseLimit],
  )

  useEffect(() => {
    if (escalasMes.length === 0) {
      setMesAtivoKey(null)
      setEscalaMes(null)
      return
    }

    const visiveis = filterReleasedEscalas(escalasMes, adminMode, releaseLimit)
    const pool = adminMode ? escalasMes : visiveis

    setMesAtivoKey((current) => {
      if (
        current &&
        pool.some((e) => mesKeyFromEscala(e) === current) &&
        isEscalaReleased(
          escalasMes.find((e) => mesKeyFromEscala(e) === current)!,
          adminMode,
          releaseLimit,
        )
      ) {
        return current
      }
      return pickDefaultMesKey(visiveis, readSavedMesKey())
    })
  }, [adminMode, escalasMes, releaseLimit])

  useEffect(() => {
    if (!mesAtivoKey) {
      setEscalaMes(null)
      return
    }
    const item =
      escalasMes.find((e) => mesKeyFromEscala(e) === mesAtivoKey) ?? null
    setEscalaMes(
      item && isEscalaReleased(item, adminMode, releaseLimit) ? item : null,
    )
  }, [mesAtivoKey, escalasMes, adminMode, releaseLimit])

  useEffect(() => {
    if (!mesAtivoKey) {
      setPlantaoMes(null)
      return
    }
    const item =
      plantoesMes.find((p) => mesKeyFromEscala(p) === mesAtivoKey) ?? null
    setPlantaoMes(
      item && isEscalaReleased(
        {
          mesAno: item.mesAno,
          mes: item.mes,
          ano: item.ano,
          dias: [],
          horarios: [],
          totalMissas: 0,
        },
        adminMode,
        releaseLimit,
      )
        ? item
        : null,
    )
  }, [mesAtivoKey, plantoesMes, adminMode, releaseLimit])

  const html = useMemo(() => {
    if (!config || !escala || escala.porData.length === 0) return null
    return generateDemonstrativoHtml(config, escala.porData)
  }, [config, escala])

  const handleSaveConfig = () => {
    if (!config) return

    const normalized: SheetConfig = {
      ...config,
      spreadsheetId: config.spreadsheetId.trim(),
    }

    setConfig(normalized)
    saveLocalConfig(normalized)
    downloadConfigFile(normalized)
    setSaved(true)
    setConfigSource(getConfigSourceHint(['config.json', '.env', 'navegador (salvo)']))
    setTimeout(() => setSaved(false), 5000)
    void loadEscala(normalized)
  }

  const handleReload = () => {
    if (config) loadEscala(config)
  }

  const handlePreview = () => {
    if (html) openHtmlPreview(html)
  }

  const handleDownload = () => {
    if (html) downloadHtml(html)
  }

  if (booting || !config) {
    return (
      <div className="app app-loading">
        <p>Carregando configuração…</p>
      </div>
    )
  }

  const isMobileView = view === 'escala-mes' || view === 'plantao-extra'
  const showBottomNav =
    Boolean(config.extraSheetName?.trim()) && isMobileView
  const showHeader = !isMobileView || adminMode

  return (
    <div className={`app${isMobileView ? ' app--escala' : ''}`}>
      {showHeader && (
        <header className={`app-header${isMobileView ? ' app-header--minimal' : ''}`}>
          {!isMobileView && (
            <div>
              <p className="eyebrow">Escala MESC</p>
              <h1>Demonstrativo de escala</h1>
              <p className="lead">
                Gere o HTML da escala a partir da planilha configurada em{' '}
                <code>config.json</code> ou <code>.env</code>.
              </p>
            </div>
          )}
          {adminMode && <AppNav active={view} onChange={setView} adminMode />}
        </header>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <main className={`main-content${isMobileView ? ' main-content--full' : ''}`}>
        {view === 'escala-mes' && (
          <EscalaMesPage
            escala={escalaMes}
            meses={mesesParaPicker}
            totalMesesNaPlanilha={escalasMes.length}
            mesAtivoKey={mesAtivoKey}
            onSelectMes={handleSelectMes}
            isMesReleased={(item) => isEscalaReleased(item, false, releaseLimit)}
            escalaLiberadaAte={releaseLimit}
            adminMode={adminMode}
            loading={loading}
            onReload={handleReload}
            onAdminUnlock={handleAdminUnlock}
          />
        )}

        {view === 'plantao-extra' && (
          <PlantaoExtraPage
            plantao={plantaoMes}
            meses={plantoesParaPicker}
            totalMesesNaPlanilha={plantoesMes.length}
            mesAtivoKey={mesAtivoKey}
            onSelectMes={handleSelectMes}
            isMesReleased={(item) => isEscalaReleased(item, false, releaseLimit)}
            escalaLiberadaAte={releaseLimit}
            adminMode={adminMode}
            loading={loading}
            onReload={handleReload}
            onAdminUnlock={handleAdminUnlock}
            loadError={plantaoError}
          />
        )}

        {adminMode && view === 'demonstrativo' && (
          <DemonstrativoPage
            config={config}
            escala={escala}
            html={html}
            loading={loading}
            onReload={handleReload}
            onPreview={handlePreview}
            onDownload={handleDownload}
          />
        )}

        {adminMode && view === 'planilha' && (
          <PlanilhaPage
            config={config}
            escala={escala}
            loading={loading}
            onReload={handleReload}
          />
        )}

        {adminMode && view === 'configuracao' && (
          <ConfiguracaoPage
            config={config}
            configSource={configSource}
            onChange={setConfig}
            onSave={handleSaveConfig}
            saved={saved}
            onAdminLock={handleAdminLock}
          />
        )}
      </main>

      {showBottomNav && (
        <AppBottomNav active={view} onChange={setView} />
      )}
    </div>
  )
}

export default App
