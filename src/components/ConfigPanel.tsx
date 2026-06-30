import type { ColumnNames, SheetConfig } from '../types'
import { COLUMN_FIELD_LABELS } from '../types'

interface Props {
  config: SheetConfig
  configSource: string
  onChange: (config: SheetConfig) => void
  onSave: () => void
  saved: boolean
}

export function ConfigPanel({ config, configSource, onChange, onSave, saved }: Props) {
  const update = (field: keyof SheetConfig, value: string | number | undefined) => {
    onChange({ ...config, [field]: value })
  }

  const updateColumn = (field: keyof ColumnNames, value: string) => {
    onChange({
      ...config,
      columns: {
        ...config.columns,
        [field]: value,
      },
    })
  }

  return (
    <section className="panel config-panel">
      <h2>Planilha e demonstrativo</h2>
      <p className="panel-hint config-source">{configSource}</p>

      <div className="field">
        <label htmlFor="spreadsheetId">Link ou ID da planilha</label>
        <input
          id="spreadsheetId"
          type="text"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={config.spreadsheetId}
          onChange={(e) => update('spreadsheetId', e.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="sheetName">Nome da aba</label>
          <input
            id="sheetName"
            type="text"
            placeholder="Escala"
            value={config.sheetName}
            onChange={(e) => update('sheetName', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="headerRow">Linha do cabeçalho</label>
          <input
            id="headerRow"
            type="number"
            min={1}
            placeholder="Automático"
            value={config.headerRow ?? ''}
            onChange={(e) =>
              update('headerRow', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      <details className="columns-details">
        <summary>Mapeamento manual de colunas (opcional)</summary>
        <p className="panel-hint">
          Informe o texto do cabeçalho na planilha. Deixe vazio para detecção
          automática. Veja os nomes reais na aba Planilha.
        </p>
        <div className="columns-grid">
          {(Object.keys(COLUMN_FIELD_LABELS) as Array<keyof ColumnNames>).map(
            (field) => (
              <div className="field" key={field}>
                <label htmlFor={`col-${field}`}>{COLUMN_FIELD_LABELS[field]}</label>
                <input
                  id={`col-${field}`}
                  type="text"
                  placeholder="Nome do cabeçalho"
                  value={config.columns?.[field] ?? ''}
                  onChange={(e) => updateColumn(field, e.target.value)}
                />
              </div>
            ),
          )}
        </div>
      </details>

      <div className="field-row">
        <div className="field">
          <label htmlFor="periodo">Período (opcional)</label>
          <input
            id="periodo"
            type="text"
            placeholder="Ex.: Julho 2026"
            value={config.periodo}
            onChange={(e) => update('periodo', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="titulo">Título do demonstrativo</label>
        <input
          id="titulo"
          type="text"
          value={config.titulo}
          onChange={(e) => update('titulo', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="subtitulo">Subtítulo</label>
        <input
          id="subtitulo"
          type="text"
          value={config.subtitulo}
          onChange={(e) => update('subtitulo', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="coordenacao">Coordenação (opcional)</label>
        <textarea
          id="coordenacao"
          rows={3}
          placeholder="Nomes dos coordenadores, um por linha"
          value={config.coordenacao}
          onChange={(e) => update('coordenacao', e.target.value)}
        />
      </div>

      <h3 className="config-panel__subtitle">Publicação da escala (app)</h3>
      <p className="panel-hint">
        Estes campos equivalem às variáveis <code>VITE_*</code> do{' '}
        <code>.env</code>. Ao salvar, vão para o navegador e para o{' '}
        <code>config.json</code> baixado.
      </p>

      <div className="field">
        <label htmlFor="escalaLiberadaAte">Mês liberado para ministros</label>
        <input
          id="escalaLiberadaAte"
          type="month"
          value={config.escalaLiberadaAte ?? ''}
          onChange={(e) =>
            update('escalaLiberadaAte', e.target.value || undefined)
          }
        />
        <p className="field-hint">
          Formato AAAA-MM. Ministros veem só meses até este limite. Vazio =
          todos os meses da planilha. Você (admin) sempre vê tudo.
        </p>
      </div>

      <div className="field field--readonly">
        <label>Chave de administrador</label>
        <p className="field-hint">
          Defina <code>VITE_ADMIN_KEY</code> no <code>.env</code> (não aparece
          aqui por segurança). Acesso: <code>?admin=SUA_CHAVE</code> na URL.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onSave}
        disabled={!config.spreadsheetId.trim()}
      >
        Salvar configuração
      </button>

      {saved && (
        <p className="save-feedback" role="status">
          Configuração salva. Substitua <code>public/config.json</code> pelo
          arquivo baixado para persistir no projeto.
        </p>
      )}
    </section>
  )
}
