import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ContracteLlistat } from '../../../shared/tipus'

// Obre l'edició d'un contracte. Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
export function useEditarContracte(): (c: ContracteLlistat) => void {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (c) => {
    const anar = (): void => {
      navigate(`/immobles/${c.id_inmoble}/contractes/${c.id}`)
    }
    if (c.data_fi === null) {
      anar()
      return
    }
    modals.openConfirmModal({
      title: t('contractes.editarTancat.titol'),
      children: <Text size="sm">{t('contractes.editarTancat.text')}</Text>,
      labels: { confirm: t('comu.editar'), cancel: t('comu.cancellar') },
      onConfirm: anar
    })
  }
}
