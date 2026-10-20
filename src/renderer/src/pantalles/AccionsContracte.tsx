import { ActionIcon, Menu, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCurrencyEuro,
  IconDots,
  IconLock,
  IconPencil,
  IconReceiptRefund,
  IconTrash
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatData } from '../utils/dates'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import DevolucioFianca from './DevolucioFianca'
import RevisarLloguer from './RevisarLloguer'
import TancarContracte from './TancarContracte'
import type { ContracteLlistat } from '../../../shared/tipus'

interface Props {
  contracte: ContracteLlistat
  // Es crida quan una acció ha canviat dades (tancar, revisar, devolució, eliminar):
  // la pantalla que mostra el contracte ha de tornar a llegir la llista.
  onCanvi: () => void
}

// Menú d'accions d'un contracte (una sola icona per fila). Les entrades depenen de l'estat:
// vigent (sense data de fi): Revisar lloguer i Tancar; tancat: Devolució de la fiança; tots: Editar i Eliminar.
function AccionsContracte({ contracte: c, onCanvi }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
  function editar(): void {
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

  function demanarEliminar(): void {
    const inquilins = [
      nomInquili(c.inquili_nom, c.inquili_cognoms),
      ...(c.id_inquili_2 !== null ? [nomInquili(c.inquili2_nom, c.inquili2_cognoms)] : [])
    ].join(' / ')
    modals.openConfirmModal({
      title: t('contractes.eliminar.titol'),
      children: (
        <Text size="sm">
          {t('contractes.eliminar.confirmacio', { inquilins, inici: formatData(c.data_inici) })}
        </Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.contractes.eliminar(c.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('contractes.eliminat') })
        onCanvi()
      }
    })
  }

  function tancar(): void {
    modals.open({
      title: t('contractes.tancar.titol'),
      children: <TancarContracte contracte={c} onTancat={onCanvi} />
    })
  }

  function revisar(): void {
    modals.open({
      title: t('contractes.revisar.titol'),
      children: <RevisarLloguer contracte={c} onRevisat={onCanvi} />
    })
  }

  function devolucio(): void {
    modals.open({
      title: t('contractes.devolucio.titol'),
      children: <DevolucioFianca contracte={c} onDesat={onCanvi} />
    })
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label={t('contractes.accions.titol')}>
          <ActionIcon variant="subtle" aria-label={t('contractes.accions.titol')}>
            <IconDots size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {c.data_fi === null && (
          <>
            <Menu.Item leftSection={<IconCurrencyEuro size={16} />} onClick={revisar}>
              {t('contractes.accions.revisarLloguer')}
            </Menu.Item>
            <Menu.Item leftSection={<IconLock size={16} />} onClick={tancar}>
              {t('contractes.accions.tancar')}
            </Menu.Item>
          </>
        )}
        {c.data_fi !== null && (
          <Menu.Item leftSection={<IconReceiptRefund size={16} />} onClick={devolucio}>
            {t('contractes.accions.devolucio')}
          </Menu.Item>
        )}
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={editar}>
          {t('comu.editar')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={demanarEliminar}>
          {t('comu.eliminar')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default AccionsContracte
