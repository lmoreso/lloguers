import { NumberInput } from '@mantine/core'
import type { NumberInputProps } from '@mantine/core'
import { useTranslation } from 'react-i18next'

type Tipus = 'import' | 'superficie'

// Separadors de milers i decimals de l'idioma actiu (p. ex. "." i "," en català i en castellà).
function separadors(llengua: string): { milers: string; decimals: string } {
  const parts = new Intl.NumberFormat(llengua).formatToParts(1234567.5)
  return {
    milers: parts.find((p) => p.type === 'group')?.value ?? '',
    decimals: parts.find((p) => p.type === 'decimal')?.value ?? ','
  }
}

// Camp numèric amb punt de milers, coma decimal i unitat (€ o m²) segons l'idioma actiu. Es fa servir
// com un camp de Mantine: `{...form.getInputProps('camp')}`. El valor és un número, o '' si és buit
// (o un text mentre s'escriu, p. ex. "12,").
function CampNumeric({ tipus, ...resta }: { tipus: Tipus } & NumberInputProps): React.JSX.Element {
  const { i18n } = useTranslation()
  const { milers, decimals } = separadors(i18n.language)
  return (
    <NumberInput
      hideControls
      allowNegative={false}
      thousandSeparator={milers || false}
      decimalSeparator={decimals}
      decimalScale={2}
      fixedDecimalScale={tipus === 'import'}
      suffix={tipus === 'import' ? ' €' : ' m²'}
      placeholder={tipus === 'import' ? '0,00 €' : '0,00 m²'}
      {...resta}
    />
  )
}

export default CampNumeric
