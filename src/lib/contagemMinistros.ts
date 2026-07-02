import type { EscalaMes, PlantaoExtraMes } from '../types'
import { isDiaUtil } from './diaUtils'

export interface MinistroContagem {
  nome: string
  comunhao: number
  adoracao: number
  extra: number
  total: number
}

type Bucket = {
  nome: string
  comunhao: number
  adoracao: number
  extra: number
}

function nomeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase()
}

/** Separa nomes em células como "Edna, Ana / Vieira e Nágila". */
export function parseNomesEscalados(raw: string): string[] {
  return raw
    .split(/[,/|]|(?:\s+e\s+)/i)
    .map((part) => part.trim())
    .filter(Boolean)
}

function ensureBucket(
  map: Map<string, Bucket>,
  nome: string,
): Bucket {
  const key = nomeKey(nome)
  const existing = map.get(key)
  if (existing) return existing

  const bucket: Bucket = {
    nome,
    comunhao: 0,
    adoracao: 0,
    extra: 0,
  }
  map.set(key, bucket)
  return bucket
}

function addComunhao(map: Map<string, Bucket>, nomes: string[]) {
  for (const nome of nomes) {
    ensureBucket(map, nome).comunhao += 1
  }
}

function addAdoracao(map: Map<string, Bucket>, nomes: string[]) {
  for (const nome of nomes) {
    ensureBucket(map, nome).adoracao += 1
  }
}

function addExtra(map: Map<string, Bucket>, nomes: string[]) {
  for (const nome of nomes) {
    ensureBucket(map, nome).extra += 1
  }
}

export function contagemMinistrosMes(
  escala: EscalaMes,
  plantao: PlantaoExtraMes | null = null,
): MinistroContagem[] {
  const map = new Map<string, Bucket>()

  for (const dia of escala.dias) {
    for (const missa of dia.missas) {
      addComunhao(map, parseNomesEscalados(missa.mesc))

      if (isDiaUtil(missa.diaSemana) && missa.adoracao.trim()) {
        addAdoracao(map, parseNomesEscalados(missa.adoracao))
      }
    }
  }

  if (plantao && plantao.ano === escala.ano && plantao.mes === escala.mes) {
    for (const dia of plantao.dias) {
      addExtra(map, dia.ministros)
    }
  }

  return [...map.values()]
    .map((item) => ({
      ...item,
      total: item.comunhao + item.adoracao + item.extra,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function totaisContagemMinistros(itens: MinistroContagem[]): {
  ministros: number
  comunhao: number
  adoracao: number
  extra: number
  servicos: number
} {
  return itens.reduce(
    (acc, item) => ({
      ministros: acc.ministros + 1,
      comunhao: acc.comunhao + item.comunhao,
      adoracao: acc.adoracao + item.adoracao,
      extra: acc.extra + item.extra,
      servicos: acc.servicos + item.total,
    }),
    { ministros: 0, comunhao: 0, adoracao: 0, extra: 0, servicos: 0 },
  )
}
