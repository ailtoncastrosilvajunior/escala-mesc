export function isDomingo(diaSemana: string): boolean {
  return diaSemana.toLowerCase().includes('domingo')
}

export function isSabado(diaSemana: string): boolean {
  const d = diaSemana.toLowerCase()
  return d.includes('sábado') || d.includes('sabado')
}

/** Segunda a sexta — dias com adoração matinal na planilha. */
export function isDiaUtil(diaSemana: string): boolean {
  return !isDomingo(diaSemana) && !isSabado(diaSemana)
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function formatDiaTitulo(
  diaSemana: string,
  diaNumero: number,
  mes: number,
): string {
  const mesNome = MESES[mes - 1] ?? ''
  return `${diaSemana}, ${diaNumero} de ${mesNome}`
}
