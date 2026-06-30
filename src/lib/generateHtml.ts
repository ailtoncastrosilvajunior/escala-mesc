import type { EscalaPorData, SheetConfig } from '../types'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderEscalados(
  escalados: EscalaPorData['escalados'],
): string {
  if (escalados.length === 0) {
    return '<span class="muted">—</span>'
  }

  const items = escalados
    .map((e) => {
      const funcao = escapeHtml(e.funcao || '—')
      const servo = escapeHtml(e.servo || '—')
      const obs = e.observacao
        ? ` <span class="obs">(${escapeHtml(e.observacao)})</span>`
        : ''
      return `<li><strong>${funcao}</strong> · ${servo}${obs}</li>`
    })
    .join('')

  return `<ul class="compact">${items}</ul>`
}

export function generateDemonstrativoHtml(
  config: SheetConfig,
  escala: EscalaPorData[],
): string {
  const titulo = escapeHtml(config.titulo || 'Demonstrativo · Escala MESC')
  const subtitulo = escapeHtml(config.subtitulo || '')
  const periodo = escapeHtml(config.periodo || '')
  const coordenacao = escapeHtml(config.coordenacao || '')

  const rows = escala
    .map((bloco, index) => {
      const dataLabel = [bloco.data, bloco.diaSemana].filter(Boolean).join(' · ')
      const eventoLabel = [bloco.horario, bloco.evento].filter(Boolean).join(' · ')

      return `
        <tr>
          <td class="num">${index + 1}º</td>
          <td class="data-cell">${escapeHtml(dataLabel || '—')}</td>
          <td class="evento-cell">${escapeHtml(eventoLabel || '—')}</td>
          <td class="escalados-cell">${renderEscalados(bloco.escalados)}</td>
        </tr>`
    })
    .join('')

  const coordBox = coordenacao
    ? `
    <div class="coord-box">
      <strong>Coordenação</strong>
      <div class="linhas">${coordenacao.replace(/\n/g, '<br>')}</div>
    </div>`
    : ''

  const emptyState =
    escala.length === 0
      ? `<p class="empty">Nenhum registro encontrado na planilha para este período.</p>`
      : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo}${periodo ? ` · ${periodo}` : ''}</title>
  <style>
    :root {
      --ink: #1c1917;
      --muted: #57534e;
      --line: #d6d3d1;
      --thead: #f5f5f4;
      --accent: #0f766e;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 1rem;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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

    header.doc-head {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--ink);
    }

    header.doc-head h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    header.doc-head .sub {
      margin: 6px 0 0;
      font-size: 9px;
      color: var(--muted);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    header.doc-head .periodo {
      margin-top: 4px;
      font-size: 10px;
      font-weight: 700;
      color: var(--accent);
    }

    .coord-box {
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 6px 8px;
      margin-bottom: 10px;
      background: linear-gradient(to bottom, #fafaf9, #fff);
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

    table.grid {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    table.grid th,
    table.grid td {
      border: 1px solid var(--line);
      padding: 4px 5px;
      vertical-align: top;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }

    table.grid thead th {
      background: var(--thead);
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      text-align: center;
    }

    table.grid tbody td.num {
      width: 28px;
      text-align: center;
      font-weight: 700;
      font-size: 9px;
      background: #fafaf9;
    }

    table.grid tbody td.data-cell {
      width: 18%;
      font-weight: 700;
      font-size: 9.5px;
    }

    table.grid tbody td.evento-cell {
      width: 22%;
      font-weight: 600;
      font-size: 9px;
    }

    .muted {
      color: var(--muted);
      font-style: italic;
      font-size: 9px;
    }

    .obs {
      color: var(--muted);
      font-weight: 500;
      font-size: 8.5px;
    }

    ul.compact {
      margin: 0;
      padding-left: 1em;
    }

    ul.compact li {
      margin: 0 0 2px;
      font-size: 9px;
    }

    .empty {
      text-align: center;
      color: var(--muted);
      font-style: italic;
      padding: 2rem 0;
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

    footer.doc-foot {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid var(--line);
      font-size: 8px;
      color: #78716c;
      text-align: center;
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
        margin: 10mm;
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
    ${emptyState}

    ${
      escala.length > 0
        ? `<table class="grid" aria-label="Escala MESC">
      <thead>
        <tr>
          <th>#</th>
          <th>Data</th>
          <th>Evento / Horário</th>
          <th>Escalados</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
        : ''
    }

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

export function downloadHtml(html: string, filename = 'demonstrativo-escala-mesc.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function openHtmlPreview(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
}
