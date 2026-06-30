import { useMemo } from 'react'
import type { EscalaLinha } from '../types'

interface Props {
  linhas: EscalaLinha[]
}

export function EscalaTable({ linhas }: Props) {
  const total = useMemo(() => linhas.length, [linhas])

  if (total === 0) {
    return (
      <div className="empty-table">
        <p>Nenhuma linha carregada. Conecte a planilha e clique em «Carregar escala».</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <div className="table-meta">
        <span>{total} registro{total !== 1 ? 's' : ''}</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Dia</th>
            <th>Horário</th>
            <th>Evento</th>
            <th>Função</th>
            <th>Servo</th>
            <th>Obs.</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={`${linha.data}-${linha.servo}-${i}`}>
              <td>{linha.data || '—'}</td>
              <td>{linha.diaSemana || '—'}</td>
              <td>{linha.horario || '—'}</td>
              <td>{linha.evento || '—'}</td>
              <td>{linha.funcao || '—'}</td>
              <td>{linha.servo || '—'}</td>
              <td>{linha.observacao || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
