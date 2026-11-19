import dayjs from 'dayjs'
import type { Immoble } from './tipus'

// "Carrer Major 12, 3r 2a": la porta és opcional.
export function adreca(i: Pick<Immoble, 'via' | 'num_via' | 'pis' | 'porta'>): string {
  return `${i.via} ${i.num_via}, ${i.pis}${i.porta ? ` ${i.porta}` : ''}`
} // Data ISO AAAA-MM-DD (o null) -> DD/MM/AAAA per mostrar-la. Només per a la interfície:
// a la BD i als valors dels formularis les dates es queden en ISO.

export function formatData(iso: string | null): string {
  return iso ? dayjs(iso).format('DD/MM/YYYY') : ''
}
export const formatM2 = (value: number): string =>
  `${new Intl.NumberFormat('ca-ES', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value)} m²`

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)

export function nomSencer(nom: string, cognoms: string): string {
  return `${nom} ${cognoms}`
}
