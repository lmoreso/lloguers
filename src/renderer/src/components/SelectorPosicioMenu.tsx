import { SegmentedControl } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { PosicioMenu } from '../../../shared/tipus'
import { esPosicioMenu } from '../../../shared/validacions'
import { esOk } from '../utils/resultat'

interface Props {
  posicio: PosicioMenu
  onCanviar: (posicio: PosicioMenu) => void
}

function SelectorPosicioMenu({ posicio, onCanviar }: Props): React.JSX.Element {
  const { t } = useTranslation()

  async function canviar(valor: string): Promise<void> {
    if (!esPosicioMenu(valor)) return

    const resposta = await window.api.config.desar({ posicioMenu: valor })
    if (!esOk(resposta)) return

    onCanviar(valor)
  }

  return (
    <SegmentedControl
      value={posicio}
      onChange={canviar}
      data={[
        { value: 'top', label: t('configuracio.menuSuperior') },
        { value: 'left', label: t('configuracio.menuLateral') }
      ]}
    />
  )
}

export default SelectorPosicioMenu
