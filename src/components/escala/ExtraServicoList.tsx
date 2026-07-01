import type { ServicoExtra } from '../../types'
import { isSemEventoExtra } from '../../lib/parseEscalaExtra'
import { servicoEventoTitulo, servicoTipoBorderClass, servicoTipoClassName } from '../../lib/servicoExtraTipo'

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
        const eventoTitulo = vazio
          ? servico.evento
          : servicoEventoTitulo(servico.evento, servico.tipo)
        const key = `${servico.evento}-${servico.horario}-${index}`

        const tipoBorder = servico.tipo && !vazio
          ? servicoTipoBorderClass(servico.tipo)
          : ''

        const mostrarTopo = !vazio && (servico.horario || servico.tipo)

        return (
          <li
            key={key}
            className={`extra-servico${vazio ? ' extra-servico--vazio' : ''}${
              tipoBorder ? ` ${tipoBorder}` : ''
            }`}
          >
            {mostrarTopo && (
              <div className="extra-servico__top">
                {servico.horario ? (
                  <span className="extra-servico__horario">{servico.horario}</span>
                ) : (
                  <span className="extra-servico__horario extra-servico__horario--vazio" />
                )}
                {servico.tipo && (
                  <span
                    className={`extra-servico__tipo ${servicoTipoClassName(servico.tipo)}`}
                  >
                    {servico.tipo}
                  </span>
                )}
              </div>
            )}

            {eventoTitulo && (
              <p className="extra-servico__evento">{eventoTitulo}</p>
            )}

            {!vazio && (
              <>
                {servico.local && (
                  <p className="extra-servico__local">{servico.local}</p>
                )}
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
