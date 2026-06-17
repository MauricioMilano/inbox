import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `${diffDays} dias`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateSiteToken(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  const randomPart = Array.from(new Uint8Array(8))
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('')
  return 'mb_' + uuid + randomPart
}
