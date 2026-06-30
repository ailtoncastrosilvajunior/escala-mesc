export function getTodayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface CalendarCell {
  dateISO: string | null
  dayNumber: number | null
  isCurrentMonth: boolean
  isToday: boolean
  hasEscala: boolean
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function getWeekdayLabels(): string[] {
  return WEEKDAYS
}

/** Grade do mês (domingo = primeira coluna). */
export function buildMonthGrid(
  ano: number,
  mes: number,
  diasComEscala: Set<string>,
  todayISO: string,
): CalendarCell[] {
  const firstDay = new Date(ano, mes - 1, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(ano, mes, 0).getDate()

  const cells: CalendarCell[] = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({
      dateISO: null,
      dayNumber: null,
      isCurrentMonth: false,
      isToday: false,
      hasEscala: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateISO = `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      dateISO,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateISO === todayISO,
      hasEscala: diasComEscala.has(dateISO),
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      dateISO: null,
      dayNumber: null,
      isCurrentMonth: false,
      isToday: false,
      hasEscala: false,
    })
  }

  return cells
}

export function initialSelectedDate(
  escala: { ano: number; mes: number; dias: Array<{ dataISO: string }> },
): string | null {
  const today = getTodayISO()
  const [y, m] = today.split('-').map(Number)

  if (y === escala.ano && m === escala.mes) {
    return today
  }

  return escala.dias[0]?.dataISO ?? null
}
