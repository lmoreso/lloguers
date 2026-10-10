import { SegmentedControl } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import type { Idioma } from '../../../shared/tipus'

const IDIOMES: Idioma[] = ['ca', 'es']

function SelectorIdioma(): React.JSX.Element {
  const { t, i18n } = useTranslation()

  async function canviar(valor: string): Promise<void> {
    const idioma = IDIOMES.find((i) => i === valor)
    if (!idioma) return

    // Primer es desa al disc; només si va bé es canvia la interfície.
    const resposta = await window.api.config.desar({ idioma })
    if (!resposta.ok) {
      notifications.show({ color: 'red', message: t(`errors.${resposta.error}`) })
      return
    }
    await i18n.changeLanguage(idioma)
  }

  return (
    <SegmentedControl
      value={i18n.language}
      onChange={canviar}
      data={IDIOMES.map((i) => ({ value: i, label: t(`configuracio.idiomes.${i}`) }))}
    />
  )
}

export default SelectorIdioma
