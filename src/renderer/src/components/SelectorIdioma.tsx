import { SegmentedControl } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { IDIOMES } from '../../../shared/tipus'
import { esOk } from '../utils/resultat'

function SelectorIdioma(): React.JSX.Element {
  const { i18n } = useTranslation()

  async function canviar(valor: string): Promise<void> {
    const idioma = IDIOMES.find((i) => i === valor)
    if (!idioma) return

    // Primer es desa al disc; només si va bé es canvia la interfície.
    const resposta = await window.api.config.desar({ idioma })
    if (!esOk(resposta)) return
    await i18n.changeLanguage(idioma)
  }

  return (
    <SegmentedControl
      value={i18n.language}
      onChange={canviar}
      // Cada idioma es mostra pel seu propi nom, llegit del seu recurs (no de l'idioma actiu).
      data={IDIOMES.map((i) => ({ value: i, label: i18n.getFixedT(i)('idiomaNom') }))}
    />
  )
}

export default SelectorIdioma
