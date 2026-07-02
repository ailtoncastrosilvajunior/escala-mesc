import { useEffect, useMemo, useRef, useState } from 'react'
import type { EscalaMes, PlantaoExtraMes } from '../../types'
import {
  contagemMinistrosMes,
  totaisContagemMinistros,
} from '../../lib/contagemMinistros'

interface Props {
  escala: EscalaMes
  plantao: PlantaoExtraMes | null
}

const COLUNAS_BASE = [
  { key: 'C', titulo: 'Comunhão' },
  { key: 'A', titulo: 'Adoração' },
] as const

const COLUNA_EXTRA = { key: 'E', titulo: 'Extra' } as const
const COLUNA_TOTAL = { key: 'T', titulo: 'Total' } as const

const CARD_MIN_PX = 184
const CARD_GAP_PX = 8

function fmtValor(valor: number): string {
  return valor > 0 ? String(valor) : '·'
}

function ColunasHead({
  colunas,
}: {
  colunas: { key: string; titulo: string }[]
}) {
  return (
    <>
      <span className="demo-ministros__cols-nome">Ministro</span>
      {colunas.map((col) => (
        <span
          key={col.key}
          className={`demo-ministros__cols-letra${
            col.key === 'T' ? ' demo-ministros__cols-letra--total' : ''
          }`}
          title={col.titulo}
        >
          {col.key}
        </span>
      ))}
    </>
  )
}

export function DemonstrativoMinistrosPanel({ escala, plantao }: Props) {
  const painelRef = useRef<HTMLDivElement>(null)
  const [colCount, setColCount] = useState(1)

  const itens = useMemo(
    () => contagemMinistrosMes(escala, plantao),
    [escala, plantao],
  )
  const totais = useMemo(() => totaisContagemMinistros(itens), [itens])
  const temExtra = totais.extra > 0

  const colunas = useMemo(
    () => [
      ...COLUNAS_BASE,
      ...(temExtra ? [COLUNA_EXTRA] : []),
      COLUNA_TOTAL,
    ],
    [temExtra],
  )

  useEffect(() => {
    const node = painelRef.current
    if (!node) return

    const update = () => {
      const width = node.clientWidth - 16
      const count = Math.max(
        1,
        Math.floor((width + CARD_GAP_PX) / (CARD_MIN_PX + CARD_GAP_PX)),
      )
      setColCount(count)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (itens.length === 0) {
    return (
      <section className="demo-ministros" aria-label="Demonstrativo de ministros">
        <h3 className="demo-ministros__titulo">Ministros e serviços</h3>
        <p className="demo-ministros__vazio">Nenhum serviço encontrado neste mês.</p>
      </section>
    )
  }

  return (
    <section className="demo-ministros" aria-label="Demonstrativo de ministros">
      <div className="demo-ministros__head">
        <div>
          <h3 className="demo-ministros__titulo">Ministros e serviços</h3>
          <p className="demo-ministros__sub">
            {totais.ministros} ministros · {totais.servicos} serviços no mês · ordem
            alfabética
          </p>
        </div>
        <dl className="demo-ministros__resumo">
          <div>
            <dt>Comunhão</dt>
            <dd>{totais.comunhao}</dd>
          </div>
          <div>
            <dt>Adoração</dt>
            <dd>{totais.adoracao}</dd>
          </div>
          {temExtra && (
            <div>
              <dt>Extra</dt>
              <dd>{totais.extra}</dd>
            </div>
          )}
          <div>
            <dt>Total</dt>
            <dd>{totais.servicos}</dd>
          </div>
        </dl>
      </div>

      <div
        ref={painelRef}
        className={`demo-ministros__painel${
          temExtra ? ' demo-ministros__painel--extra' : ''
        }`}
      >
        <p className="demo-ministros__legenda" aria-label="Legenda das colunas">
          {colunas.map((col, index) => (
            <span key={col.key} className="demo-ministros__legenda-item">
              {index > 0 && ' · '}
              <strong>{col.key}</strong> {col.titulo}
            </span>
          ))}
        </p>

        <div className="demo-ministros__grid">
          <div className="demo-ministros__cols-band" aria-hidden="true">
            {Array.from({ length: colCount }, (_, index) => (
              <div key={index} className="demo-ministros__cols-head">
                <ColunasHead colunas={colunas} />
              </div>
            ))}
          </div>

          <ul className="demo-ministros__lista">
            {itens.map((item) => (
              <li key={item.nome} className="demo-ministros__item">
                <span className="demo-ministros__nome">{item.nome}</span>
                <span
                  className={`demo-ministros__stat${
                    item.comunhao ? '' : ' demo-ministros__stat--vazio'
                  }`}
                  title="Comunhão"
                >
                  {fmtValor(item.comunhao)}
                </span>
                <span
                  className={`demo-ministros__stat${
                    item.adoracao ? '' : ' demo-ministros__stat--vazio'
                  }`}
                  title="Adoração"
                >
                  {fmtValor(item.adoracao)}
                </span>
                {temExtra && (
                  <span
                    className={`demo-ministros__stat${
                      item.extra ? '' : ' demo-ministros__stat--vazio'
                    }`}
                    title="Extra"
                  >
                    {fmtValor(item.extra)}
                  </span>
                )}
                <span
                  className="demo-ministros__stat demo-ministros__stat--total"
                  title="Total"
                >
                  {item.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
