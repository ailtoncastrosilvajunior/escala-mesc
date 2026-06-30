import type { AppView } from '../types'

const STORAGE_KEY = 'escala-mesc-admin'

const ADMIN_VIEWS: AppView[] = ['demonstrativo', 'planilha', 'configuracao']

function getAdminKey(): string | undefined {
  const value = import.meta.env.VITE_ADMIN_KEY
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function isAdminView(view: AppView): boolean {
  return ADMIN_VIEWS.includes(view)
}

export function isAdminUnlocked(): boolean {
  if (localStorage.getItem(STORAGE_KEY) === '1') return true
  // Sem chave no .env: admin só no dev local (npm run dev)
  if (import.meta.env.DEV && !getAdminKey()) return true
  return false
}

export function unlockAdmin(): void {
  localStorage.setItem(STORAGE_KEY, '1')
}

export function lockAdmin(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function tryUnlockWithKey(input: string): boolean {
  const expected = getAdminKey()
  if (!expected) return false
  if (input.trim() !== expected) return false
  unlockAdmin()
  return true
}

/** Lê ?admin=CHAVE na URL, desbloqueia e remove o parâmetro da barra de endereço. */
export function tryUnlockFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('admin')
  if (!token) return false

  const ok = tryUnlockWithKey(token)
  if (!ok) return false

  const url = new URL(window.location.href)
  url.searchParams.delete('admin')
  const clean = url.pathname + url.search + url.hash
  window.history.replaceState({}, '', clean)
  return true
}
