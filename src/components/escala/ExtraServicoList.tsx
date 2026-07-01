import type { ServicoExtra } from '../../types'
import { isSemEventoExtra } from '../../lib/parseEscalaExtra'
import { servicoTipoBorderClass, servicoTipoClassName } from '../../lib/servicoExtraTipo'

interface Props {
  servicos: ServicoExtra[]
}

function telefoneHref(telefone: string): string | null {
  const trimmed = telefone.trim()
  if (!trimmed || trimmed === '…' || trimmed === '—') return null
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length < 8) return null
  return `tel:+55${digits}`
}

function ServicoMeta({ servico }: { servico: ServicoExtra }) {
  const parts = [servico.horario, servico.local].filter(Boolean)
  if (parts.length === 0) return null
  return <p className="extra-servico__meta">{parts.join(' · ')}</p>
}

function ServicoResponsavel({ servico }: { servico: ServicoExtra }) {
  const href = telefoneHref(servico.telefone)
  if (!servico.responsavel && !servico.telefone) return null

  return (
    <p className="extra-servico__resp">
      {servico.responsavel && (
        <span className="extra-servico__resp-nome">{servico.responsavel}</span>
      )}
      {servico.telefone && (
        <>
          {servico.responsavel && ' · '}
          {href ? (
            <a className="extra-servico__tel" href={href}>
              {servico.telefone}
            </a>
          ) : (
            <span className="extra-servico__tel">{servico.telefone}</span>
          )}
        </>
      )}
    </p>
  )
}

export function ExtraServicoList({ servicos }: Props) {
  if (servicos.length === 0) return null

  return (
    <ul className="extra-servico-list">
      {servicos.map((servico, index) => {
        const vazio = isSemEventoExtra(servico.evento)
        const key = `${servico.evento}-${servico.horario}-${index}`

        const tipoBorder = servico.tipo && !vazio
          ? servicoTipoBorderClass(servico.tipo)
          : ''

        return (
          <li
            key={key}
            className={`extra-servico${vazio ? ' extra-servico--vazio' : ''}${
              tipoBorder ? ` ${tipoBorder}` : ''
            }`}
          >
            {!vazio && servico.tipo && (
              <span
                className={`extra-servico__tipo ${servicoTipoClassName(servico.tipo)}`}
              >
                {servico.tipo}
              </span>
            )}
            <p className="extra-servico__evento">{servico.evento}</p>
            {!vazio && (
              <>
                <ServicoMeta servico={servico} />
                <ServicoResponsavel servico={servico} />
                {servico.observacao && (
                  <p className="extra-servico__obs">{servico.observacao}</p>
                )}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
