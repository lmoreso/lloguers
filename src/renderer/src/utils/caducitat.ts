import dayjs from 'dayjs'

// Dies d'antelació amb què s'avisa que un document està a punt de caducar.
export const DIES_AVIS = 60

export type EstatCaducitat = 'caducat' | 'aviat' | null

// `data` és text ISO AAAA-MM-DD (o null). Es compara només el dia, en hora local:
// el dia de caducitat el document encara es considera vigent.
export function estatCaducitat(data: string | null): EstatCaducitat {
  if (!data) return null
  const caducitat = dayjs(data)
  if (!caducitat.isValid()) return null
  const avui = dayjs().startOf('day')
  if (caducitat.isBefore(avui)) return 'caducat'
  if (caducitat.diff(avui, 'day') <= DIES_AVIS) return 'aviat'
  return null
}
