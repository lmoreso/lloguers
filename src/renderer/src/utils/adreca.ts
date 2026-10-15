import type { Immoble } from '../../../shared/tipus'

// "Carrer Major 12, 3r 2a": la porta és opcional.
export function adreca(i: Pick<Immoble, 'via' | 'num_via' | 'pis' | 'porta'>): string {
  return `${i.via} ${i.num_via}, ${i.pis}${i.porta ? ` ${i.porta}` : ''}`
}
