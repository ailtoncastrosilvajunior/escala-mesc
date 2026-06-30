import type { AppView } from '../types'

interface Props {
  active: AppView
  onChange: (view: AppView) => void
  adminMode?: boolean
}

const publicItems: Array<{ id: AppView; label: string }> = [
  { id: 'escala-mes', label: 'Escala do mês' },
]

const adminItems: Array<{ id: AppView; label: string }> = [
  { id: 'demonstrativo', label: 'Demonstrativo' },
  { id: 'planilha', label: 'Planilha' },
  { id: 'configuracao', label: 'Configuração' },
]

export function AppNav({ active, onChange, adminMode = false }: Props) {
  const items = adminMode ? [...publicItems, ...adminItems] : publicItems

  return (
    <nav className="app-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-tab${active === item.id ? ' active' : ''}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
