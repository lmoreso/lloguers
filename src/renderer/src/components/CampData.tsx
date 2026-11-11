import { DateInput, type DateInputProps } from '@mantine/dates'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface CampDataProps extends Omit<
  DateInputProps,
  'locale' | 'valueFormat' | 'placeholder' | 'dateParser'
> {}

// Interpreta el text d'una data escrita a mà (DD/MM/AAAA, o DD/MM/AA). Retorna la data en ISO (AAAA-MM-DD) o
// `null` si no és vàlida: un format raro, o una data que no existeix (30/02, 31/04, 29/02 d'un any no de traspàs).
// JavaScript no rebutja les dates inexistents sinó que les desplaça (30/02 passa a ser el 2 de març), així que
// es comprova que dia, mes i any de la data construïda coincideixen amb els escrits.
const dateParser: DateInputProps['dateParser'] = (input) => {
  const text = input.trim()
  if (!text) return null
  if (!/^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(text)) return null

  const [dia, mes, anyEscrit] = text.split('/').map(Number)
  // Amb dos dígits, s'interpreta com a 20xx si és < 50, i com a 19xx si és >= 50.
  const any = anyEscrit < 100 ? anyEscrit + (anyEscrit < 50 ? 2000 : 1900) : anyEscrit

  const data = new Date(any, mes - 1, dia)
  if (data.getFullYear() !== any || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    return null
  }
  return dayjs(data).format('YYYY-MM-DD')
}

/**
 * Un camp de data personalitzat.
 * El format de visualització és DD/MM/YYYY, i s'accepten també anys amb només dos dígits.
 * Si algún dia s'implementes l'idioma angles, caldrà canviar el format de visualització a MM/DD/YYYY.
 * @param props
 * @returns
 */
export function CampData(props: CampDataProps): React.JSX.Element {
  const { i18n } = useTranslation()

  return (
    <DateInput
      {...props}
      locale={i18n.language}
      dateParser={dateParser}
      valueFormat="DD/MM/YYYY"
      placeholder="DD/MM/AAAA"
    />
  )
}
