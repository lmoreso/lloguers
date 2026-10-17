import dayjs from 'dayjs'

// Dies d'antelació amb què s'avisa que un document d'un immoble està a punt de caducar.
export const DIES_AVIS = 60
// Dies d'antelació per als avisos dels contractes vigents.
export const DIES_AVIS_FI = 90
export const DIES_AVIS_REVISIO = 30

export type EstatCaducitat = 'caducat' | 'aviat' | null

// `data` és text ISO AAAA-MM-DD (o null). Es compara només el dia, en hora local:
// el dia de la data encara es considera vigent.
export function estatCaducitat(data: string | null, diesAvis: number = DIES_AVIS): EstatCaducitat {
  if (!data) return null
  const caducitat = dayjs(data)
  if (!caducitat.isValid()) return null
  const avui = dayjs().startOf('day')
  if (caducitat.isBefore(avui)) return 'caducat'
  if (caducitat.diff(avui, 'day') <= diesAvis) return 'aviat'
  return null
}

// Aniversari de l'última revisió del lloguer: un any després (ISO).
export function aniversariRevisio(dataUltimaRevisio: string): string {
  return dayjs(dataUltimaRevisio).add(1, 'year').format('YYYY-MM-DD')
}
