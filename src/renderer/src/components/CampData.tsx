import { DateInput, type DateInputProps } from '@mantine/dates'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface MyDateInputProps extends Omit<
  DateInputProps,
  'locale' | 'valueFormat' | 'placeholder' | 'dateParser'
> {}

const dateParser: DateInputProps['dateParser'] = (input) => {
  if (!input.trim()) return null

  const [day, month, year] = input.split('/')

  let any = Number(year)
  if (any < 100) {
    // Si només hi ha dos dígits, s'interpreta com a 20xx si és < 50, i com a 19xx si és >= 50.
    any += any < 50 ? 2000 : 1900
  }
  const data = new Date(Number(any), Number(month) - 1, Number(day))

  //  const parsed = dayjs(input, 'DD/MM/YYYY', true)
  const parsed = dayjs(data)

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
}
/**
 * Un camp de data personalitzat.
 * El format de visualització és DD/MM/YYYY, i s'accepten també anys amb només dos dígits.
 * Si algún dia s'implementes l'idioma angles, caldrà canviar el format de visualització a MM/DD/YYYY.
 * @param props
 * @returns
 */
export function CampData(props: MyDateInputProps): React.JSX.Element {
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
