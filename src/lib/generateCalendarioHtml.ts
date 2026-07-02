import type { DiaEscala, EscalaMes, MissaEvent, SheetConfig } from '../types'
import { buildMonthGrid, getTodayISO, getWeekdayLabels } from './calendarUtils'
import { isDomingo, isDiaUtil } from './diaUtils'
import { horarioLabel } from './parseEscalaMesc'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderMissaBloco(missa: MissaEvent): string {
  const horario = escapeHtml(horarioLabel(missa.horario))
  const celebrante = missa.celebrante.trim()
  const mostrarAdoracao = isDiaUtil(missa.diaSemana) && missa.adoracao.trim()
  const mesc = missa.mesc.trim()
  const obs = missa.observacoes.trim()

  const head = `
    <div class="missa-head">
      <span class="missa-hora">${horario}</span>
      ${celebrante ? `<span class="missa-celebr">${escapeHtml(celebrante)}</span>` : ''}
    </div>`

  const blocoMesc = mesc
    ? `<div class="missa-bloco missa-bloco--mesc">
        <span class="missa-rotulo">Comunhão (MESC)</span>
        <span class="missa-valor">${escapeHtml(mesc)}</span>
      </div>`
    : ''

  const blocoAdoracao = mostrarAdoracao
    ? `<div class="missa-bloco missa-bloco--adoracao">
        <span class="missa-rotulo">Adoração · 7h30–9h30</span>
        <span class="missa-valor">${escapeHtml(missa.adoracao)}</span>
      </div>`
    : ''

  const obsHtml = obs ? `<p class="missa-obs">${escapeHtml(obs)}</p>` : ''

  return `<div class="missa">${head}${blocoMesc}${blocoAdoracao}${obsHtml}</div>`
}

function renderDiaCell(dia: DiaEscala, isToday: boolean): string {
  const domingo = isDomingo(dia.diaSemana)
  const classes = [
    'cal-cell',
    'cal-cell--escala',
    domingo ? 'cal-cell--domingo' : '',
    isToday ? 'cal-cell--hoje' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const missas = dia.missas.map(renderMissaBloco).join('')

  return `<article class="${classes}">
    <header class="cal-head">
      <span class="cal-num">${dia.diaNumero}</span>
      <span class="cal-semana">${escapeHtml(dia.diaSemana.slice(0, 3))}</span>
    </header>
    <div class="cal-body">${missas}</div>
  </article>`
}

function renderEmptyCell(dayNumber: number, isToday: boolean): string {
  return `<div class="cal-cell cal-cell--vazio${isToday ? ' cal-cell--hoje' : ''}">
    <header class="cal-head"><span class="cal-num">${dayNumber}</span></header>
  </div>`
}

export function generateCalendarioDemonstrativoHtml(
  config: SheetConfig,
  escala: EscalaMes,
): string {
  const titulo = escapeHtml(config.titulo || 'Demonstrativo · Escala MESC')
  const subtitulo = escapeHtml(config.subtitulo || '')
  const coordenacao = escapeHtml(config.coordenacao || '')
  const periodo = escapeHtml(escala.mesAno || config.periodo || '')
  const todayISO = getTodayISO()

  const diaMap = new Map(escala.dias.map((d) => [d.dataISO, d]))
  const diasComServico = new Set(escala.dias.map((d) => d.dataISO))
  const cells = buildMonthGrid(escala.ano, escala.mes, diasComServico, todayISO)
  const weekdays = getWeekdayLabels()

  const weekdayHeaders = weekdays
    .map((label) => `<span class="cal-weekday">${label}</span>`)
    .join('')

  const gridCells = cells
    .map((cell) => {
      if (!cell.isCurrentMonth || cell.dayNumber === null || !cell.dateISO) {
        return `<div class="cal-cell cal-cell--empty" aria-hidden="true"></div>`
      }

      const dia = diaMap.get(cell.dateISO)
      if (dia && dia.missas.length > 0) {
        return renderDiaCell(dia, cell.isToday)
      }

      return renderEmptyCell(cell.dayNumber, cell.isToday)
    })
    .join('')

  const coordBox = coordenacao
    ? `<div class="coord-box">
        <strong>Coordenação</strong>
        <div class="linhas">${coordenacao.replace(/\n/g, '<br>')}</div>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo} · ${escapeHtml(escala.mesAno)}</title>
  <style>
    :root {
      --ink: #1c1917;
      --muted: #57534e;
      --line: #d6d3d1;
      --accent: #1d4ed8;
      --green: #15803d;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 1rem;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 10px;
      line-height: 1.35;
      color: var(--ink);
      background: #fafaf9;
    }

    .sheet {
      max-width: 297mm;
      margin: 0 auto;
      background: #fff;
      padding: 10mm 12mm;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
    }

    .doc-head {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--ink);
    }

    .doc-head h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .doc-head .sub {
      margin: 6px 0 0;
      font-size: 9px;
      color: var(--muted);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .doc-head .periodo {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
    }

    .coord-box {
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 6px 8px;
      margin-bottom: 8px;
      background: #fafaf9;
    }

    .coord-box strong {
      display: block;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 4px;
    }

    .coord-box .linhas {
      font-size: 10px;
      font-weight: 600;
      line-height: 1.45;
    }

    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
      border-bottom: none;
    }

    .cal-weekday {
      padding: 4px 2px;
      text-align: center;
      font-size: 7px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      background: #f5f5f4;
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }

    .cal-cell {
      min-height: 22mm;
      padding: 2px 3px 3px;
      background: #fff;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .cal-cell--empty {
      background: #fafaf9;
      min-height: 8mm;
    }

    .cal-cell--vazio {
      background: #fafaf9;
    }

    .cal-cell--domingo {
      background: #fffbeb;
    }

    .cal-cell--hoje {
      box-shadow: inset 0 0 0 1.5px var(--accent);
    }

    .cal-head {
      display: flex;
      align-items: baseline;
      gap: 3px;
      margin-bottom: 2px;
      flex-shrink: 0;
    }

    .cal-num {
      font-size: 8px;
      font-weight: 800;
      line-height: 1;
    }

    .cal-cell--hoje .cal-num {
      color: var(--accent);
    }

    .cal-semana {
      font-size: 6px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--muted);
    }

    .cal-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-height: 0;
    }

    .missa {
      padding: 2px 3px;
      border-radius: 2px;
      background: #f8fafc;
      border: 1px solid rgba(0, 0, 0, 0.06);
      font-size: 6.5px;
      line-height: 1.3;
    }

    .cal-cell--domingo .missa {
      background: #fff;
    }

    .missa-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2px 3px;
      margin-bottom: 1px;
    }

    .missa-hora {
      padding: 0 3px;
      border-radius: 999px;
      background: rgba(37, 99, 235, 0.12);
      color: var(--accent);
      font-size: 6px;
      font-weight: 800;
    }

    .missa-celebr {
      font-size: 6px;
      font-weight: 700;
      color: var(--accent);
      word-break: break-word;
    }

    .missa-bloco {
      margin-top: 1px;
    }

    .missa-bloco + .missa-bloco {
      margin-top: 2px;
      padding-top: 2px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .missa-rotulo {
      display: block;
      font-size: 5.5px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 0.5px;
    }

    .missa-bloco--mesc .missa-rotulo { color: var(--accent); }
    .missa-bloco--adoracao .missa-rotulo { color: var(--green); }

    .missa-valor {
      display: block;
      font-size: 6px;
      font-weight: 700;
      word-break: break-word;
    }

    .missa-obs {
      margin: 1px 0 0;
      font-size: 5.5px;
      color: var(--muted);
      font-style: italic;
    }

    .doc-foot {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid var(--line);
      font-size: 8px;
      color: #78716c;
      text-align: center;
    }

    .hint-screen-only {
      margin-top: 12px;
      padding: 10px;
      background: #ecfdf5;
      border: 1px solid #99f6e4;
      border-radius: 6px;
      font-size: 11px;
      color: #134e4a;
    }

    @media print {
      .sheet,
      .sheet * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        padding: 0;
        background: #fff;
      }

      .sheet {
        box-shadow: none;
        border-radius: 0;
        max-width: none;
        padding: 0;
      }

      .hint-screen-only {
        display: none !important;
      }

      @page {
        size: A4 landscape;
        margin: 8mm;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="doc-head">
      <h1>${titulo}</h1>
      ${subtitulo ? `<p class="sub">${subtitulo}</p>` : ''}
      ${periodo ? `<p class="periodo">${periodo}</p>` : ''}
    </header>

    ${coordBox}

    <div class="cal-weekdays">${weekdayHeaders}</div>
    <div class="cal-grid">${gridCells}</div>

    <footer class="doc-foot">
      Gerado em ${escapeHtml(new Date().toLocaleString('pt-BR'))} · Escala MESC
    </footer>
  </div>

  <div class="hint-screen-only">
    <strong>Imprimir:</strong> use <kbd>Ctrl+P</kbd> / <kbd>Cmd+P</kbd> · destino «Salvar como PDF» · papel <strong>A4 horizontal</strong>.
    No Chrome/Edge, active «Gráficos de fundo» nas opções de impressão.
  </div>
</body>
</html>`
}

export function calendarioHtmlFilename(escala: EscalaMes): string {
  const mes = String(escala.mes).padStart(2, '0')
  return `demonstrativo-calendario-${escala.ano}-${mes}.html`
}
