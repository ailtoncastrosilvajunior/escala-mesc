import type { AppView } from '../types'

interface Props {
  active: AppView
  onChange: (view: AppView) => void
}

const items: Array<{
  id: AppView
  label: string
  icon: 'escala' | 'plantao'
}> = [
  { id: 'escala-mes', label: 'Escala', icon: 'escala' },
  { id: 'plantao-extra', label: 'Extra', icon: 'plantao' },
]

function NavIcon({ type }: { type: 'escala' | 'plantao' }) {
  if (type === 'escala') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="app-bottom-nav__svg">
        <rect x="4" y="5" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 10h16M9 5v3M15 5v3" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-bottom-nav__svg">
      <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 19c1.6-2.4 3.4-3.5 5-3.5s3.4 1.1 5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13 17.5c.8-1.2 1.8-1.8 3-1.8s2.2.6 3 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AppBottomNav({ active, onChange }: Props) {
  return (
    <nav className="app-bottom-nav" aria-label="Navegação principal">
      {items.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`app-bottom-nav__item${isActive ? ' app-bottom-nav__item--active' : ''}`}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="app-bottom-nav__indicator" aria-hidden="true" />
            <NavIcon type={item.icon} />
            <span className="app-bottom-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
