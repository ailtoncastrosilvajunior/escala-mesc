interface Props {
  horarios: string[]
  selected: string | null
  onChange: (horario: string | null) => void
  search?: string
  onSearchChange?: (value: string) => void
  /** search = só busca; horarios = só chips de horário; full = busca + horários */
  variant?: 'search' | 'full' | 'horarios'
}

export function EscalaFilters({
  horarios,
  selected,
  onChange,
  search = '',
  onSearchChange,
  variant = 'full',
}: Props) {
  const showHorarios =
    (variant === 'full' || variant === 'horarios') && horarios.length > 1
  const showSearch =
    (variant === 'full' || variant === 'search') && onSearchChange

  return (
    <div className="escala-filters">
      {showSearch && (
        <>
          <label className="escala-filters__label" htmlFor="busca-nome">
            Buscar por nome
          </label>
          <input
            id="busca-nome"
            type="search"
            className="escala-filters__search"
            placeholder="Digite seu nome…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
          />
        </>
      )}

      {showHorarios && (
        <div className="escala-filters__horarios" role="group" aria-labelledby="filtro-horario">
          <p id="filtro-horario" className="escala-filters__label">
            Horário da missa
          </p>
          <div className="escala-filters__chips">
            <button
              type="button"
              className={`filter-chip${selected === null ? ' active' : ''}`}
              onClick={() => onChange(null)}
            >
              Todos
            </button>
            {horarios.map((horario) => (
              <button
                key={horario}
                type="button"
                className={`filter-chip${selected === horario ? ' active' : ''}`}
                onClick={() => onChange(horario)}
              >
                {horario.endsWith('h') ? horario : `${horario}h`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
