import dayjs from 'dayjs'

// Data ISO AAAA-MM-DD (o null) -> DD/MM/AAAA per mostrar-la. Només per a la interfície:
// a la BD i als valors dels formularis les dates es queden en ISO.
export function formatData(iso: string | null): string {
  return iso ? dayjs(iso).format('DD/MM/YYYY') : ''
}
