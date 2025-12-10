import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function getUrgencyColor(urgency: string | null) {
  if (urgency === 'akut') return 'bg-destructive text-destructive-foreground'
  return 'bg-muted text-muted-foreground'
}

export function getStatusColor(status: string | null) {
  switch (status) {
    case 'new':
      return 'bg-primary/20 text-primary'
    case 'contacted':
      return 'bg-yellow-500/20 text-yellow-600'
    case 'scheduled':
      return 'bg-green-500/20 text-green-600'
    case 'completed':
      return 'bg-blue-500/20 text-blue-600'
    case 'lost':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function getStatusLabel(status: string | null) {
  switch (status) {
    case 'new': return 'Neu'
    case 'contacted': return 'Kontaktiert'
    case 'scheduled': return 'Termin vereinbart'
    case 'completed': return 'Abgeschlossen'
    case 'lost': return 'Verloren'
    default: return status || 'Unbekannt'
  }
}
