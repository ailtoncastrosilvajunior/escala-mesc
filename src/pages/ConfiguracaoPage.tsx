import { ConfigPanel } from '../components/ConfigPanel'
import type { SheetConfig } from '../types'

interface Props {
  config: SheetConfig
  configSource: string
  onChange: (config: SheetConfig) => void
  onSave: () => void
  saved: boolean
  onAdminLock?: () => void
}

export function ConfiguracaoPage({
  config,
  configSource,
  onChange,
  onSave,
  saved,
  onAdminLock,
}: Props) {
  return (
    <div className="configuracao-page">
      <ConfigPanel
        config={config}
        configSource={configSource}
        onChange={onChange}
        onSave={onSave}
        saved={saved}
      />

      <section className="panel config-docs">
        <h3>Onde guardar a configuração</h3>
        <ol>
          <li>
            <strong>config.json</strong> — edite <code>public/config.json</code>{' '}
            (ou copie de <code>public/config.example.json</code>). É carregado
            automaticamente ao abrir o app.
          </li>
          <li>
            <strong>.env</strong> — valores iniciais via <code>VITE_*</code>.
            Sobrescrevem o JSON na build, exceto se você salvar de novo na tela
            abaixo (navegador tem prioridade).
          </li>
          <li>
            <strong>Tela Configuração</strong> — edita planilha, demonstrativo
            e mês liberado. «Salvar» grava no navegador e baixa um{' '}
            <code>config.json</code> para substituir em{' '}
            <code>public/config.json</code>.
          </li>
          <li>
            <strong>Prioridade</strong> — padrões → config.json → .env →
            navegador (salvo).
          </li>
          <li>
            <strong>Chave admin</strong> — só no <code>.env</code> (
            <code>VITE_ADMIN_KEY</code>), não entra no JSON público.
          </li>
        </ol>
      </section>

      {onAdminLock && (
        <section className="panel config-docs">
          <h3>Modo administrador</h3>
          <p className="config-admin-hint">
            As abas de administração ficam ocultas para quem usa a escala. Neste
            aparelho elas estão liberadas.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onAdminLock}>
            Ocultar abas de admin neste aparelho
          </button>
        </section>
      )}
    </div>
  )
}
